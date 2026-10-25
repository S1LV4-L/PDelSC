// routes/cursos.js: cursos (año 1 a 7 + división)
import { Router } from "express";
import pool from "../db.js";
import { verificarToken, verificarPermiso } from "../scripts/auth.js";
import { entero } from "../scripts/helpers.js";

const router = Router();
const gestion = [verificarToken, verificarPermiso("gestionar_cursos")];

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

export default router;
