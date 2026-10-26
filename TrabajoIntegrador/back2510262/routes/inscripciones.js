// routes/inscripciones.js: curso y materias de un alumno (admin)
import { Router } from "express";
import pool from "../db.js";
import { verificarToken, verificarPermiso } from "../scripts/auth.js";
import { entero } from "../scripts/helpers.js";

const router = Router();
const asignar = [verificarToken, verificarPermiso("asignar_cursos")];

// ---------- Curso y materias de un alumno (admin) ----------

// Body: { id } (id del alumno)
router.post("/alumnos/asignaciones", ...asignar, async (req, res) => {
  const { id } = req.body;
  if (!entero(id, 1, Infinity)) return res.status(400).json({ error: "Id inválido" });

  const [[curso]] = await pool.query(
    `SELECT c.id, c.anio, c.division FROM usuarios u
     JOIN cursos c ON c.id = u.curso_id WHERE u.id = ?`, [id]);
  const [dictados] = await pool.query(
    `SELECT d.id, m.nombre AS materia, c.anio, c.division
     FROM inscripciones i
     JOIN dictados d ON d.id = i.dictado_id
     JOIN materias m ON m.id = d.materia_id
     JOIN cursos c ON c.id = d.curso_id
     WHERE i.alumno_id = ? ORDER BY c.anio, m.nombre`, [id]);
  res.json({ curso: curso ?? null, dictados });
});

// Body: { id, cursoId }. Al cambiar de curso se quitan las inscripciones que ya no corresponden:
// las de años superiores y las del mismo año pero de otra división. Las recursadas (años anteriores) se conservan.
router.post("/alumnos/asignar-curso", ...asignar, async (req, res) => {
  const { id, cursoId } = req.body;
  if (!entero(id, 1, Infinity) || !entero(cursoId, 1, Infinity)) {
    return res.status(400).json({ error: "id y cursoId son obligatorios" });
  }

  const [alumno] = await pool.query(
    `SELECT u.id FROM usuarios u JOIN perfiles p ON p.id = u.perfil_id
     WHERE u.id = ? AND p.nombre = 'Alumno'`, [id]);
  if (alumno.length === 0) return res.status(404).json({ error: "Alumno no encontrado" });

  const [[curso]] = await pool.query("SELECT anio FROM cursos WHERE id = ?", [cursoId]);
  if (!curso) return res.status(404).json({ error: "Curso no encontrado" });

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query("UPDATE usuarios SET curso_id = ? WHERE id = ?", [cursoId, id]);
    await conn.query(
      `DELETE i FROM inscripciones i
       JOIN dictados d ON d.id = i.dictado_id
       JOIN materias m ON m.id = d.materia_id
       WHERE i.alumno_id = ? AND (m.anio > ? OR (m.anio = ? AND d.curso_id <> ?))`,
      [id, curso.anio, curso.anio, cursoId]
    );
    await conn.commit();
    res.json({ ok: true });
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
});

// Body: { id, dictadoIds: [1, 2] }. Reemplaza las inscripciones del alumno.
// Reglas: dictado de su propio curso, o de un año anterior (recursada); nunca de un año superior.
router.post("/alumnos/asignar-dictados", ...asignar, async (req, res) => {
  const { id, dictadoIds } = req.body;
  if (!entero(id, 1, Infinity) || !Array.isArray(dictadoIds)) {
    return res.status(400).json({ error: "id y dictadoIds (lista) son obligatorios" });
  }
  const ids = [...new Set(dictadoIds.map(Number))];
  if (ids.some((i) => !Number.isInteger(i) || i < 1)) {
    return res.status(400).json({ error: "dictadoIds inválido" });
  }

  const [[ac]] = await pool.query(
    `SELECT u.curso_id, c.anio FROM usuarios u
     JOIN cursos c ON c.id = u.curso_id WHERE u.id = ?`, [id]);
  if (!ac) return res.status(400).json({ error: "Asignale primero un curso al alumno" });

  let dictados = [];
  if (ids.length) {
    [dictados] = await pool.query(
      `SELECT d.id, d.materia_id, d.curso_id, m.anio
       FROM dictados d JOIN materias m ON m.id = d.materia_id
       WHERE d.id IN (?)`, [ids]);
    if (dictados.length !== ids.length) return res.status(400).json({ error: "Hay dictados inexistentes" });

    const invalido = dictados.some((d) => d.anio > ac.anio || (d.anio === ac.anio && d.curso_id !== ac.curso_id));
    if (invalido) {
      return res.status(400).json({
        error: "Solo se permiten materias de su curso o recursadas de años anteriores",
      });
    }
    if (new Set(dictados.map((d) => d.materia_id)).size !== dictados.length) {
      return res.status(400).json({ error: "No se puede repetir una materia" });
    }
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query("DELETE FROM inscripciones WHERE alumno_id = ?", [id]);
    if (dictados.length) {
      await conn.query(
        "INSERT INTO inscripciones (alumno_id, dictado_id) VALUES ?",
        [dictados.map((d) => [id, d.id])]
      );
    }
    await conn.commit();
    res.json({ ok: true });
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
});

export default router;
