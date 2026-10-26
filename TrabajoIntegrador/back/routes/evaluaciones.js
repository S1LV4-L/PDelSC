// routes/evaluaciones.js: carga rápida de notas de un curso, e importación / exportación CSV
import { Router } from "express";
import pool from "../db.js";
import { verificarToken, verificarPermiso, verificarProfesorDelDictado } from "../scripts/auth.js";
import { parsearCsv, sinTildes } from "../scripts/csv.js";
import { hoyDB, leerFecha } from "../scripts/fechas.js";
import { etiquetaDictado, registrarAuditoria } from "../scripts/auditoria.js";

const router = Router();
const gate = [verificarToken, verificarPermiso("gestionar_calificaciones"), verificarProfesorDelDictado];
const MAX_FILAS = 1000;
const MAX_ERRORES = 100;

// Nota de 1 a 10 con un decimal como máximo (coma o punto). null si no es válida
const leerNota = (v) => {
  const t = String(v ?? "").trim();
  return /^(10([.,]0)?|[1-9]([.,]\d)?)$/.test(t) ? Number(t.replace(",", ".")) : null;
};

// Alumnos activos inscriptos en el dictado
const alumnosDelDictado = async (dictadoId) => {
  const [rows] = await pool.query(
    `SELECT u.id, u.nombre FROM inscripciones i
     JOIN usuarios u ON u.id = i.alumno_id AND u.oculto_en IS NULL
     WHERE i.dictado_id = ? ORDER BY u.nombre`,
    [dictadoId]
  );
  return rows;
};

// Una nota se identifica por alumno + título + fecha (para no duplicarla)
const clave = (alumnoId, titulo, fecha) => `${alumnoId}|${titulo.trim().toLowerCase()}|${fecha}`;
const clavesExistentes = async (dictadoId) => {
  const [rows] = await pool.query(
    `SELECT alumno_id, titulo, DATE_FORMAT(fecha, '%Y-%m-%d') AS fecha
     FROM calificaciones WHERE dictado_id = ?`,
    [dictadoId]
  );
  return new Set(rows.map((r) => clave(r.alumno_id, r.titulo, r.fecha)));
};

// Un solo INSERT: o entran todas las notas o ninguna
const insertarNotas = (dictadoId, profesorId, filas) =>
  pool.query(
    "INSERT INTO calificaciones (dictado_id, alumno_id, titulo, nota, fecha, creada_por) VALUES ?",
    [filas.map((f) => [dictadoId, f.alumnoId, f.titulo, f.nota, f.fecha, profesorId])]
  );

// Body: { dictadoId }. Alumnos activos del dictado y la fecha de hoy según el servidor
router.post("/evaluaciones/alumnos", ...gate, async (req, res) => {
  res.json({ alumnos: await alumnosDelDictado(req.dictadoId), hoy: await hoyDB() });
});

// Body: { dictadoId, titulo, fecha, notas: [{ alumnoId, nota }] }. Una evaluación para varios alumnos
router.post("/evaluaciones/cargar", ...gate, async (req, res) => {
  const titulo = String(req.body.titulo ?? "").trim();
  if (!titulo || titulo.length > 100) {
    return res.status(400).json({ error: "El título es obligatorio (máximo 100 caracteres)" });
  }
  const fecha = leerFecha(req.body.fecha);
  if (!fecha) return res.status(400).json({ error: "La fecha debe tener el formato YYYY-MM-DD" });
  if (fecha > (await hoyDB())) return res.status(400).json({ error: "La fecha no puede ser futura" });

  const notas = req.body.notas;
  if (!Array.isArray(notas) || notas.length === 0 || notas.length > MAX_FILAS) {
    return res.status(400).json({ error: "Carga al menos una nota" });
  }

  const alumnos = new Map((await alumnosDelDictado(req.dictadoId)).map((a) => [a.id, a.nombre]));
  const vistos = await clavesExistentes(req.dictadoId);
  const filas = [];
  for (const n of notas) {
    const alumnoId = Number(n?.alumnoId);
    const nombre = alumnos.get(alumnoId);
    if (!nombre) return res.status(400).json({ error: "Hay alumnos que no cursan esta materia" });
    const nota = leerNota(n?.nota);
    if (nota === null) {
      return res.status(400).json({ error: `La nota de ${nombre} debe estar entre 1 y 10, con un decimal como máximo` });
    }
    const k = clave(alumnoId, titulo, fecha);
    if (vistos.has(k)) return res.status(409).json({ error: `${nombre} ya tiene una nota "${titulo}" en esa fecha` });
    vistos.add(k);
    filas.push({ alumnoId, titulo, nota, fecha });
  }
  await insertarNotas(req.dictadoId, req.usuarioId, filas);
  res.status(201).json({ creadas: filas.length });
});

// Body: { dictadoId, tipo: "plantilla" | "notas" }. Tabla con las mismas columnas que acepta la importación
router.post("/evaluaciones/exportar", ...gate, async (req, res) => {
  const [[d]] = await pool.query(
    `SELECT m.nombre AS materia, c.anio, c.division FROM dictados d
     JOIN materias m ON m.id = d.materia_id JOIN cursos c ON c.id = d.curso_id WHERE d.id = ?`,
    [req.dictadoId]
  );
  const columnas = ["alumno", "titulo", "nota", "fecha"];
  const etiqueta = `${d.materia} ${d.anio}°${d.division}°`;

  if (req.body.tipo === "notas") {
    const [rows] = await pool.query(
      `SELECT u.nombre, k.titulo, k.nota, DATE_FORMAT(k.fecha, '%Y-%m-%d') AS fecha
       FROM calificaciones k
       JOIN usuarios u ON u.id = k.alumno_id AND u.oculto_en IS NULL
       WHERE k.dictado_id = ? ORDER BY u.nombre, k.fecha, k.id`,
      [req.dictadoId]
    );
    return res.json({
      titulo: `Notas · ${etiqueta}`,
      columnas,
      filas: rows.map((r) => [r.nombre, r.titulo, Number(r.nota), r.fecha]),
    });
  }
  const alumnos = await alumnosDelDictado(req.dictadoId);
  res.json({
    titulo: `Plantilla de notas · ${etiqueta}`,
    columnas,
    filas: alumnos.map((a) => [a.nombre, "", "", ""]),
  });
});

// Body: { dictadoId, csv, simular? }. Columnas: alumno (o nombre), titulo, nota, fecha.
// Todo o nada: si alguna fila no cumple el formato, no se importa ninguna.
router.post("/evaluaciones/importar", ...gate, async (req, res) => {
  const simular = req.body.simular === true;
  const tabla = parsearCsv(req.body.csv);
  if (tabla.length < 2) return res.status(400).json({ error: "El archivo no tiene filas de datos" });
  if (tabla.length - 1 > MAX_FILAS) return res.status(400).json({ error: `Máximo ${MAX_FILAS} filas por archivo` });

  const cab = tabla[0].map(sinTildes);
  const col = (...alias) => cab.findIndex((h) => alias.includes(h));
  const iAlumno = col("alumno", "nombre");
  const iTitulo = col("titulo", "evaluacion");
  const iNota = col("nota", "calificacion");
  const iFecha = col("fecha");
  if ([iAlumno, iTitulo, iNota, iFecha].includes(-1)) {
    return res.status(400).json({ error: "Faltan columnas: alumno, titulo, nota y fecha son obligatorias" });
  }

  const hoy = await hoyDB();
  const porNombre = new Map();
  for (const a of await alumnosDelDictado(req.dictadoId)) {
    const k = sinTildes(a.nombre);
    porNombre.set(k, [...(porNombre.get(k) ?? []), a]);
  }
  const vistos = await clavesExistentes(req.dictadoId);
  const errores = [];
  const filas = [];
  let total = 0;

  tabla.slice(1).forEach((fila, k) => {
    const linea = k + 2;
    const celda = (i) => String(fila[i] ?? "").trim();
    const nombre = celda(iAlumno);
    const titulo = celda(iTitulo);
    const notaTxt = celda(iNota);
    const fechaTxt = celda(iFecha);
    if (!titulo && !notaTxt && !fechaTxt) return; // fila de la plantilla sin completar: se ignora
    total++;

    const candidatos = porNombre.get(sinTildes(nombre)) ?? [];
    const nota = leerNota(notaTxt);
    const fecha = leerFecha(fechaTxt);
    let error = null;
    if (!nombre) error = "Falta el nombre del alumno";
    else if (candidatos.length > 1) error = `El nombre "${nombre}" es ambiguo`;
    else if (candidatos.length === 0) error = `El alumno "${nombre}" no existe o no cursa esta materia`;
    else if (!titulo || titulo.length > 100) error = "Falta el título (máximo 100 caracteres)";
    else if (nota === null) error = "La nota debe estar entre 1 y 10, con un decimal como máximo";
    else if (!fecha) error = "La fecha debe ser YYYY-MM-DD o DD/MM/YYYY";
    else if (fecha > hoy) error = "La fecha no puede ser futura";
    else if (vistos.has(clave(candidatos[0].id, titulo, fecha))) {
      error = `${candidatos[0].nombre} ya tiene una nota "${titulo}" en esa fecha`;
    }
    if (error) return errores.push({ linea, error });

    vistos.add(clave(candidatos[0].id, titulo, fecha));
    filas.push({ alumnoId: candidatos[0].id, titulo, nota, fecha });
  });

  if (total === 0) return res.status(400).json({ error: "El archivo no tiene notas completas: todas las filas están vacías" });

  const resumen = {
    simulado: simular,
    total,
    validos: filas.length,
    totalErrores: errores.length,
    errores: errores.slice(0, MAX_ERRORES),
  };
  if (simular || errores.length > 0) return res.json({ ...resumen, creadas: 0 });

  await insertarNotas(req.dictadoId, req.usuarioId, filas);
  await registrarAuditoria(req.usuarioId, "notas_importadas", {
    dictado: await etiquetaDictado(req.dictadoId),
    creadas: filas.length,
  });
  res.status(201).json({ ...resumen, creadas: filas.length });
});

export default router;