// routes/academico.js
import { Router } from "express";
import pool from "../db.js";
import { verificarToken, verificarPermiso } from "../scripts/auth.js";
import { obtenerPermisos } from "../scripts/helpers.js";

const router = Router();
const gestion = [verificarToken, verificarPermiso("gestionar_cursos")];
const asignar = [verificarToken, verificarPermiso("asignar_cursos")];
const entero = (v, min, max) => Number.isInteger(Number(v)) && Number(v) >= min && Number(v) <= max;

// ---------- Cursos (año 1 a 7 + división) ----------

router.post("/cursos/listar", ...gestion, async (req, res) => {
  const [rows] = await pool.query(
    `SELECT c.id, c.anio, c.division,
       (SELECT COUNT(*) FROM usuarios WHERE curso_id = c.id) AS alumnos
     FROM cursos c ORDER BY c.anio, c.division`
  );
  res.json(rows);
});

router.post("/cursos/crear", ...gestion, async (req, res) => {
  const { anio, division } = req.body;
  if (!entero(anio, 1, 7) || !entero(division, 1, 99)) {
    return res.status(400).json({ error: "Año (1 a 7) y división inválidos" });
  }
  try {
    const [r] = await pool.query("INSERT INTO cursos (anio, division) VALUES (?, ?)", [anio, division]);
    res.status(201).json({ id: r.insertId, anio: Number(anio), division: Number(division) });
  } catch (e) {
    if (e.code === "ER_DUP_ENTRY") return res.status(409).json({ error: "Ese curso ya existe" });
    throw e;
  }
});

router.post("/cursos/actualizar", ...gestion, async (req, res) => {
  const { id, anio, division } = req.body;
  if (!entero(id, 1, Infinity) || !entero(anio, 1, 7) || !entero(division, 1, 99)) {
    return res.status(400).json({ error: "Id, año (1 a 7) y división son obligatorios" });
  }
  const [[actual]] = await pool.query("SELECT anio FROM cursos WHERE id = ?", [id]);
  if (!actual) return res.status(404).json({ error: "Curso no encontrado" });

  // Cambiar el año rompería la regla materia/curso del mismo año
  if (actual.anio !== Number(anio)) {
    const [usados] = await pool.query("SELECT 1 FROM dictados WHERE curso_id = ? LIMIT 1", [id]);
    if (usados.length) {
      return res.status(409).json({ error: "El curso tiene materias dictadas: no se puede cambiar el año" });
    }
  }
  try {
    await pool.query("UPDATE cursos SET anio = ?, division = ? WHERE id = ?", [anio, division, id]);
    res.json({ ok: true });
  } catch (e) {
    if (e.code === "ER_DUP_ENTRY") return res.status(409).json({ error: "Ese curso ya existe" });
    throw e;
  }
});

router.post("/cursos/eliminar", ...gestion, async (req, res) => {
  if (!entero(req.body.id, 1, Infinity)) return res.status(400).json({ error: "Id inválido" });
  const [r] = await pool.query("DELETE FROM cursos WHERE id = ?", [req.body.id]);
  if (!r.affectedRows) return res.status(404).json({ error: "Curso no encontrado" });
  res.json({ ok: true });
});

// ---------- Materias (nombre + año) ----------

// Body opcional: { anio }
router.post("/materias/listar", ...gestion, async (req, res) => {
  const anio = req.body.anio || null;
  const [rows] = await pool.query(
    "SELECT id, nombre, anio FROM materias WHERE (? IS NULL OR anio = ?) ORDER BY anio, nombre",
    [anio, anio]
  );
  res.json(rows);
});

router.post("/materias/crear", ...gestion, async (req, res) => {
  const nombre = String(req.body.nombre ?? "").trim();
  const { anio } = req.body;
  if (!nombre || !entero(anio, 1, 7)) {
    return res.status(400).json({ error: "Nombre y año (1 a 7) son obligatorios" });
  }
  try {
    const [r] = await pool.query("INSERT INTO materias (nombre, anio) VALUES (?, ?)", [nombre, anio]);
    res.status(201).json({ id: r.insertId, nombre, anio: Number(anio) });
  } catch (e) {
    if (e.code === "ER_DUP_ENTRY") return res.status(409).json({ error: "Esa materia ya existe para ese año" });
    throw e;
  }
});

router.post("/materias/actualizar", ...gestion, async (req, res) => {
  const nombre = String(req.body.nombre ?? "").trim();
  const { id, anio } = req.body;
  if (!entero(id, 1, Infinity) || !nombre || !entero(anio, 1, 7)) {
    return res.status(400).json({ error: "Id, nombre y año (1 a 7) son obligatorios" });
  }
  const [[actual]] = await pool.query("SELECT anio FROM materias WHERE id = ?", [id]);
  if (!actual) return res.status(404).json({ error: "Materia no encontrada" });

  if (actual.anio !== Number(anio)) {
    const [usados] = await pool.query("SELECT 1 FROM dictados WHERE materia_id = ? LIMIT 1", [id]);
    if (usados.length) {
      return res.status(409).json({ error: "La materia tiene dictados asignados: no se puede cambiar el año" });
    }
  }
  try {
    await pool.query("UPDATE materias SET nombre = ?, anio = ? WHERE id = ?", [nombre, anio, id]);
    res.json({ ok: true });
  } catch (e) {
    if (e.code === "ER_DUP_ENTRY") return res.status(409).json({ error: "Esa materia ya existe para ese año" });
    throw e;
  }
});

router.post("/materias/eliminar", ...gestion, async (req, res) => {
  if (!entero(req.body.id, 1, Infinity)) return res.status(400).json({ error: "Id inválido" });
  const [r] = await pool.query("DELETE FROM materias WHERE id = ?", [req.body.id]);
  if (!r.affectedRows) return res.status(404).json({ error: "Materia no encontrada" });
  res.json({ ok: true });
});

// ---------- Dictados: profesor de una materia en un curso ----------

// Body opcional: { cursoId }
router.post("/dictados/listar", ...asignar, async (req, res) => {
  const cursoId = req.body.cursoId || null;
  const [rows] = await pool.query(
    `SELECT d.id, d.materia_id, m.nombre AS materia, d.curso_id, c.anio, c.division,
            d.profesor_id, u.nombre AS profesor
     FROM dictados d
     JOIN materias m ON m.id = d.materia_id
     JOIN cursos c ON c.id = d.curso_id
     JOIN usuarios u ON u.id = d.profesor_id
     WHERE (? IS NULL OR d.curso_id = ?)
     ORDER BY c.anio, c.division, m.nombre`,
    [cursoId, cursoId]
  );
  res.json(rows);
});

// Body: { materiaId, cursoId, profesorId }. Si el dictado ya existía, cambia el profesor
router.post("/dictados/asignar", ...asignar, async (req, res) => {
  const { materiaId, cursoId, profesorId } = req.body;
  if (![materiaId, cursoId, profesorId].every((v) => entero(v, 1, Infinity))) {
    return res.status(400).json({ error: "materiaId, cursoId y profesorId son obligatorios" });
  }

  const [[materia]] = await pool.query("SELECT anio FROM materias WHERE id = ?", [materiaId]);
  const [[curso]] = await pool.query("SELECT anio FROM cursos WHERE id = ?", [cursoId]);
  if (!materia || !curso) return res.status(404).json({ error: "Materia o curso no encontrado" });
  if (materia.anio !== curso.anio) {
    return res.status(400).json({ error: "La materia y el curso deben ser del mismo año" });
  }

  const [prof] = await pool.query(
    `SELECT u.id FROM usuarios u JOIN perfiles p ON p.id = u.perfil_id
     WHERE u.id = ? AND p.nombre = 'Profesor'`, [profesorId]);
  if (prof.length === 0) return res.status(400).json({ error: "El usuario no tiene el perfil Profesor" });

  await pool.query(
    `INSERT INTO dictados (materia_id, curso_id, profesor_id) VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE profesor_id = VALUES(profesor_id)`,
    [materiaId, cursoId, profesorId]
  );
  res.json({ ok: true });
});

router.post("/dictados/eliminar", ...asignar, async (req, res) => {
  if (!entero(req.body.id, 1, Infinity)) return res.status(400).json({ error: "Id inválido" });
  const [r] = await pool.query("DELETE FROM dictados WHERE id = ?", [req.body.id]);
  if (!r.affectedRows) return res.status(404).json({ error: "Dictado no encontrado" });
  res.json({ ok: true });
});

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

// ---------- Pantalla principal de profesor / alumno ----------
// Devuelve dictados: { id (dictado), materia, anio, division }

router.post("/mis-materias", verificarToken, async (req, res) => {
  const permisos = await obtenerPermisos(req.usuarioId);
  const base = `SELECT d.id, m.nombre AS materia, c.anio, c.division
                FROM dictados d
                JOIN materias m ON m.id = d.materia_id
                JOIN cursos c ON c.id = d.curso_id`;
  const orden = "ORDER BY c.anio, c.division, m.nombre";

  if (permisos.includes("generar_qr")) {
    const [rows] = await pool.query(`${base} WHERE d.profesor_id = ? ${orden}`, [req.usuarioId]);
    return res.json(rows);
  }
  if (permisos.includes("leer_qr")) {
    const [rows] = await pool.query(
      `${base}
       JOIN inscripciones i ON i.dictado_id = d.id
       WHERE i.alumno_id = ? ${orden}`,
      [req.usuarioId]
    );
    return res.json(rows);
  }
  res.json([]);
});

export default router;