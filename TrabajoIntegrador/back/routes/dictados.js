// routes/dictados.js: dictados (profesor de una materia en un curso) y pantalla principal
import { Router } from "express";
import pool from "../db.js";
import { verificarToken, verificarPermiso } from "../scripts/auth.js";
import { entero, obtenerPermisos } from "../scripts/helpers.js";

const router = Router();
const asignar = [verificarToken, verificarPermiso("asignar_cursos")];

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
