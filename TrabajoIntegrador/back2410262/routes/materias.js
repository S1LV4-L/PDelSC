// routes/materias.js: materias (nombre + año)
import { Router } from "express";
import pool from "../db.js";
import { verificarToken, verificarPermiso } from "../scripts/auth.js";
import { entero } from "../scripts/helpers.js";

const router = Router();
const gestion = [verificarToken, verificarPermiso("gestionar_cursos")];

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

export default router;
