// routes/calificaciones.js
import { Router } from "express";
import pool from "../db.js";
import {
  verificarToken,
  verificarPermiso,
  verificarProfesorDelDictado,
  verificarAlumnoDelDictado,
  alumnoCursaDictado,
} from "../scripts/auth.js";

const router = Router();
const gestion = [verificarToken, verificarPermiso("gestionar_calificaciones")];

const leerNota = (v) => {
  const n = Number(String(v ?? "").replace(",", "."));
  return Number.isFinite(n) && n >= 1 && n <= 10 && Math.abs(n * 10 - Math.round(n * 10)) < 1e-9 ? n : null;
};
const leerFecha = (v) => (/^\d{4}-\d{2}-\d{2}$/.test(String(v ?? "")) ? String(v) : null);
const leerTitulo = (v) => String(v ?? "").trim().slice(0, 100);
const entero = (v) => {
  const n = Number(v);
  return Number.isInteger(n) && n > 0 ? n : null;
};

// ---------- Profesor ----------

// Body: { dictadoId }
router.post("/calificaciones/listar", ...gestion, verificarProfesorDelDictado, async (req, res) => {
  const [alumnos] = await pool.query(
    `SELECT u.id, u.nombre FROM inscripciones i JOIN usuarios u ON u.id = i.alumno_id
     WHERE i.dictado_id = ? ORDER BY u.nombre`, [req.dictadoId]);
  const [filas] = await pool.query(
    `SELECT id, alumno_id, titulo, nota, DATE_FORMAT(fecha, '%Y-%m-%d') AS fecha
     FROM calificaciones WHERE dictado_id = ? ORDER BY fecha DESC, id DESC`, [req.dictadoId]);
  res.json({ alumnos, calificaciones: filas.map((c) => ({ ...c, nota: Number(c.nota) })) });
});

// Body: { dictadoId, alumnoId, titulo, nota, fecha? }
router.post("/calificaciones/crear", ...gestion, verificarProfesorDelDictado, async (req, res) => {
  const alumnoId = entero(req.body.alumnoId);
  const titulo = leerTitulo(req.body.titulo);
  const nota = leerNota(req.body.nota);
  if (!alumnoId || !titulo) return res.status(400).json({ error: "Alumno y título son obligatorios" });
  if (nota === null) return res.status(400).json({ error: "La nota debe estar entre 1 y 10" });
  if (!(await alumnoCursaDictado(alumnoId, req.dictadoId))) {
    return res.status(404).json({ error: "El alumno no cursa esta materia" });
  }
  const [r] = await pool.query(
    `INSERT INTO calificaciones (dictado_id, alumno_id, titulo, nota, fecha, creada_por)
     VALUES (?, ?, ?, ?, COALESCE(?, CURDATE()), ?)`,
    [req.dictadoId, alumnoId, titulo, nota, leerFecha(req.body.fecha), req.usuarioId]
  );
  res.status(201).json({ id: r.insertId });
});

// Body: { id, titulo, nota, fecha? }
router.post("/calificaciones/actualizar", ...gestion, async (req, res) => {
  const id = entero(req.body.id);
  const titulo = leerTitulo(req.body.titulo);
  const nota = leerNota(req.body.nota);
  if (!id || !titulo) return res.status(400).json({ error: "Id y título son obligatorios" });
  if (nota === null) return res.status(400).json({ error: "La nota debe estar entre 1 y 10" });
  const [r] = await pool.query(
    `UPDATE calificaciones k JOIN dictados d ON d.id = k.dictado_id
     SET k.titulo = ?, k.nota = ?, k.fecha = COALESCE(?, k.fecha)
     WHERE k.id = ? AND d.profesor_id = ?`,
    [titulo, nota, leerFecha(req.body.fecha), id, req.usuarioId]
  );
  if (!r.affectedRows) return res.status(404).json({ error: "Calificación no encontrada" });
  res.json({ ok: true });
});

// Body: { id }
router.post("/calificaciones/eliminar", ...gestion, async (req, res) => {
  const id = entero(req.body.id);
  if (!id) return res.status(400).json({ error: "Id inválido" });
  const [r] = await pool.query(
    `DELETE k FROM calificaciones k JOIN dictados d ON d.id = k.dictado_id
     WHERE k.id = ? AND d.profesor_id = ?`, [id, req.usuarioId]);
  if (!r.affectedRows) return res.status(404).json({ error: "Calificación no encontrada" });
  res.json({ ok: true });
});

// Body: { dictadoId }. Tabla lista para exportar a CSV/PDF
router.post("/calificaciones/planilla", ...gestion, verificarProfesorDelDictado, async (req, res) => {
  const [[d]] = await pool.query(
    `SELECT m.nombre AS materia, c.anio, c.division FROM dictados d
     JOIN materias m ON m.id = d.materia_id JOIN cursos c ON c.id = d.curso_id WHERE d.id = ?`, [req.dictadoId]);
  const [rows] = await pool.query(
    `SELECT u.nombre AS alumno, DATE_FORMAT(k.fecha, '%d/%m/%Y') AS fecha, k.titulo, k.nota
     FROM inscripciones i
     JOIN usuarios u ON u.id = i.alumno_id
     LEFT JOIN calificaciones k ON k.alumno_id = u.id AND k.dictado_id = i.dictado_id
     WHERE i.dictado_id = ? ORDER BY u.nombre, k.fecha, k.id`, [req.dictadoId]);

  const filas = [];
  let actual = null, suma = 0, n = 0;
  const cerrar = () => {
    if (actual !== null && n) filas.push([actual, "", "Promedio", (suma / n).toFixed(2)]);
  };
  for (const r of rows) {
    if (r.alumno !== actual) { cerrar(); actual = r.alumno; suma = 0; n = 0; }
    if (r.titulo) { filas.push([r.alumno, r.fecha, r.titulo, Number(r.nota)]); suma += Number(r.nota); n++; }
    else filas.push([r.alumno, "", "Sin calificaciones", ""]);
  }
  cerrar();
  res.json({
    titulo: `Planilla de notas · ${d.materia} ${d.anio}°${d.division}°`,
    columnas: ["Alumno", "Fecha", "Título", "Nota"],
    filas,
  });
});

// ---------- Alumno ----------

// Body: { dictadoId }
router.post("/calificaciones/mias", verificarToken, verificarPermiso("leer_qr"), verificarAlumnoDelDictado, async (req, res) => {
  const [rows] = await pool.query(
    `SELECT id, titulo, nota, DATE_FORMAT(fecha, '%Y-%m-%d') AS fecha
     FROM calificaciones WHERE dictado_id = ? AND alumno_id = ? ORDER BY fecha DESC, id DESC`,
    [req.dictadoId, req.usuarioId]
  );
  res.json(rows.map((c) => ({ ...c, nota: Number(c.nota) })));
});

export default router;
