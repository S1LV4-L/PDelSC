// routes/ciclo.js: carga masiva de alumnos y cambio de ciclo lectivo
import { Router } from "express";
import bcrypt from "bcrypt";
import crypto from "crypto";
import pool from "../db.js";
import { verificarToken, verificarPermiso } from "../scripts/auth.js";
import { crearCodigosRecuperacion, emailValido, normalizarEmail } from "../scripts/helpers.js";
import { registrarAuditoria } from "../scripts/auditoria.js";
import { parsearCsv, sinTildes } from "../scripts/csv.js";

const router = Router();
const gate = [verificarToken, verificarPermiso("importar_alumnos")];
const MAX_FILAS = 500;

// Body: { csv, simular? }
// Columnas: nombre, email, anio, division, materias (separadas por |, opcional), password (opcional)
// Sin materias => se inscribe en todos los dictados de su curso. Sin password => se genera una temporal.
router.post("/importacion/alumnos", ...gate, async (req, res) => {
  const simular = req.body.simular === true;
  const tabla = parsearCsv(req.body.csv);
  if (tabla.length < 2) return res.status(400).json({ error: "El archivo no tiene filas de datos" });
  if (tabla.length - 1 > MAX_FILAS) return res.status(400).json({ error: `Máximo ${MAX_FILAS} alumnos por archivo` });

  const cab = tabla[0].map(sinTildes);
  const col = (...alias) => cab.findIndex((h) => alias.includes(h));
  const iNombre = col("nombre");
  const iEmail = col("email", "correo");
  const iAnio = col("anio", "ano");
  const iDiv = col("division");
  const iMat = col("materias", "materia");
  const iPass = col("password", "contrasena");
  if ([iNombre, iEmail, iAnio, iDiv].includes(-1)) {
    return res.status(400).json({ error: "Faltan columnas: nombre, email, anio y division son obligatorias" });
  }

  const [cursos] = await pool.query("SELECT id, anio, division FROM cursos");
  const cursoPor = new Map(cursos.map((c) => [`${c.anio}-${c.division}`, c.id]));
  const [dictados] = await pool.query(
    "SELECT d.id, d.curso_id, m.nombre FROM dictados d JOIN materias m ON m.id = d.materia_id");
  const [existentes] = await pool.query("SELECT nombre, email FROM usuarios");
  const nombres = new Set(existentes.map((u) => sinTildes(u.nombre)));
  const emails = new Set(existentes.map((u) => u.email).filter(Boolean));
  const [[perfil]] = await pool.query("SELECT id FROM perfiles WHERE nombre = 'Alumno'");
  if (!perfil) return res.status(500).json({ error: "No existe el perfil Alumno" });

  const validos = [];
  const errores = [];
  tabla.slice(1).forEach((fila, k) => {
    const linea = k + 2;
    const celda = (i) => (i === -1 ? "" : String(fila[i] ?? "").trim());
    const nombre = celda(iNombre);
    const email = normalizarEmail(celda(iEmail));
    let error = null;
    let cursoId;
    let dictadoIds = [];

    if (!nombre) error = "Falta el nombre";
    else if (!emailValido(email)) error = "Email inválido";
    else if (nombres.has(sinTildes(nombre))) error = "El nombre ya existe";
    else if (emails.has(email)) error = "El email ya existe";
    else if (!(cursoId = cursoPor.get(`${Number(celda(iAnio))}-${Number(celda(iDiv))}`))) {
      error = `El curso ${celda(iAnio)}°${celda(iDiv)}° no existe`;
    } else {
      const delCurso = dictados.filter((d) => d.curso_id === cursoId);
      const pedidas = celda(iMat).split("|").map((s) => s.trim()).filter(Boolean);
      if (pedidas.length === 0) dictadoIds = delCurso.map((d) => d.id);
      else {
        for (const p of pedidas) {
          const d = delCurso.find((x) => sinTildes(x.nombre) === sinTildes(p));
          if (!d) { error = `La materia "${p}" no se dicta en ese curso`; break; }
          dictadoIds.push(d.id);
        }
      }
    }
    if (error) return errores.push({ linea, error });
    nombres.add(sinTildes(nombre)); // detecta repetidos dentro del mismo archivo
    emails.add(email);
    validos.push({ linea, nombre, email, cursoId, dictadoIds, password: celda(iPass) });
  });

  const total = tabla.length - 1;
  if (simular) return res.json({ simulado: true, total, validos: validos.length, creados: [], errores });

  const creados = [];
  for (const v of validos) {
    const password = v.password || crypto.randomBytes(6).toString("base64url");
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      const [r] = await conn.query(
        "INSERT INTO usuarios (nombre, email, password_hash, perfil_id, curso_id) VALUES (?, ?, ?, ?, ?)",
        [v.nombre, v.email, await bcrypt.hash(password, 10), perfil.id, v.cursoId]
      );
      if (v.dictadoIds.length) {
        await conn.query("INSERT INTO inscripciones (alumno_id, dictado_id) VALUES ?",
          [v.dictadoIds.map((d) => [r.insertId, d])]);
      }
      await conn.commit();
      creados.push({
        linea: v.linea, id: r.insertId, nombre: v.nombre, email: v.email, password,
        codigos: await crearCodigosRecuperacion(r.insertId),
      });
    } catch (e) {
      await conn.rollback();
      errores.push({ linea: v.linea, error: e.code === "ER_DUP_ENTRY" ? "El nombre o el email ya existen" : "No se pudo crear el alumno" });
    } finally {
      conn.release();
    }
  }
  await registrarAuditoria(req.usuarioId, "importacion", { total, creados: creados.length, errores: errores.length });
  res.status(201).json({ simulado: false, total, validos: creados.length, creados, errores });
});

// Body: { cursoId, simular?, inscribir? }. Pasa todo el curso al año siguiente (misma división).
// 7° egresa: queda sin curso. Se limpian las inscripciones viejas y, si inscribir !== false,
// se inscribe en todos los dictados del curso nuevo. El historial de asistencias se conserva.
router.post("/ciclo/promover", ...gate, async (req, res) => {
  const cursoId = Number(req.body.cursoId);
  if (!Number.isInteger(cursoId) || cursoId < 1) return res.status(400).json({ error: "cursoId es obligatorio" });
  const simular = req.body.simular === true;
  const inscribir = req.body.inscribir !== false;

  const [[curso]] = await pool.query("SELECT id, anio, division FROM cursos WHERE id = ?", [cursoId]);
  if (!curso) return res.status(404).json({ error: "Curso no encontrado" });

  const [alumnos] = await pool.query(
    `SELECT u.id FROM usuarios u JOIN perfiles p ON p.id = u.perfil_id
     WHERE u.curso_id = ? AND p.nombre = 'Alumno' AND u.oculto_en IS NULL`, [cursoId]);
  const egresan = curso.anio === 7;
  let destino = null;
  if (!egresan) {
    [[destino]] = await pool.query("SELECT id FROM cursos WHERE anio = ? AND division = ?", [curso.anio + 1, curso.division]);
  }
  const resumen = {
    curso: `${curso.anio}°${curso.division}°`,
    destino: egresan ? null : `${curso.anio + 1}°${curso.division}°`,
    crearaDestino: !egresan && !destino,
    egresan,
    alumnos: alumnos.length,
  };
  if (simular || alumnos.length === 0) return res.json({ simulado: simular, ...resumen });

  const ids = alumnos.map((a) => a.id);
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    let destinoId = destino?.id ?? null;
    if (!egresan && !destinoId) {
      const [r] = await conn.query("INSERT INTO cursos (anio, division) VALUES (?, ?)", [curso.anio + 1, curso.division]);
      destinoId = r.insertId;
    }
    await conn.query("UPDATE usuarios SET curso_id = ? WHERE id IN (?)", [destinoId, ids]);
    await conn.query("DELETE FROM inscripciones WHERE alumno_id IN (?)", [ids]);
    if (destinoId && inscribir) {
      await conn.query(
        `INSERT INTO inscripciones (alumno_id, dictado_id)
         SELECT u.id, d.id FROM usuarios u JOIN dictados d ON d.curso_id = ? WHERE u.id IN (?)`,
        [destinoId, ids]
      );
    }
    await registrarAuditoria(req.usuarioId, "promocion", resumen, conn);
    await conn.commit();
    res.json({ simulado: false, ...resumen });
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
});

export default router;
