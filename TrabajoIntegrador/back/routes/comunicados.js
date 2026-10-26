// routes/comunicados.js: comunicados oficiales de preceptoría
import { Router } from "express";
import pool from "../db.js";
import { verificarToken, verificarPermiso } from "../scripts/auth.js";
import { registrarAuditoria } from "../scripts/auditoria.js";
import { validarTextoLibre } from "../scripts/helpers.js";

const router = Router();
const enviar = [verificarToken, verificarPermiso("enviar_comunicados")];
const enteros = (v) =>
  [...new Set((Array.isArray(v) ? v : []).map(Number))].filter((n) => Number.isInteger(n) && n > 0);
const errorTextoComunicado = (titulo, mensaje) =>
  validarTextoLibre(titulo, { etiqueta: "El título", minLetras: 3, max: 120 }) ||
  validarTextoLibre(mensaje, { etiqueta: "El mensaje", minLetras: 5, max: 2000, multilinea: true });

// Body: { titulo, mensaje, alcance: "global" | "curso" | "usuario", cursoIds?, usuarioIds? }
router.post("/comunicados/enviar", ...enviar, async (req, res) => {
  const titulo = String(req.body.titulo ?? "").trim();
  const mensaje = String(req.body.mensaje ?? "").trim();
  const alcance = req.body.alcance;
  const errorTexto = errorTextoComunicado(titulo, mensaje);
  if (errorTexto) return res.status(400).json({ error: errorTexto });
  if (!titulo || !mensaje) return res.status(400).json({ error: "El título y el mensaje son obligatorios" });
  if (!["global", "curso", "usuario"].includes(alcance)) return res.status(400).json({ error: "Alcance inválido" });

  const cursoIds = alcance === "curso" ? enteros(req.body.cursoIds) : [];
  const usuarioIds = alcance === "usuario" ? enteros(req.body.usuarioIds) : [];
  if (alcance === "curso" && !cursoIds.length) return res.status(400).json({ error: "Elige al menos un curso" });
  if (alcance === "usuario" && !usuarioIds.length) return res.status(400).json({ error: "Elige al menos un destinatario" });

  if (cursoIds.length) {
    const [r] = await pool.query("SELECT id FROM cursos WHERE id IN (?)", [cursoIds]);
    if (r.length !== cursoIds.length) return res.status(400).json({ error: "Hay cursos inexistentes" });
  }
  if (usuarioIds.length) {
    const [r] = await pool.query(
      `SELECT u.id FROM usuarios u JOIN perfiles p ON p.id = u.perfil_id
       WHERE u.id IN (?) AND p.nombre IN ('Alumno', 'Profesor')`, [usuarioIds]);
    if (r.length !== usuarioIds.length) return res.status(400).json({ error: "Solo puedes escribirle a alumnos y profesores" });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [c] = await conn.query(
      "INSERT INTO comunicados (autor_id, titulo, mensaje, alcance) VALUES (?, ?, ?, ?)",
      [req.usuarioId, titulo, mensaje, alcance]);
    if (cursoIds.length) {
      await conn.query("INSERT INTO comunicado_cursos (comunicado_id, curso_id) VALUES ?", [cursoIds.map((id) => [c.insertId, id])]);
    }
    if (usuarioIds.length) {
      await conn.query("INSERT INTO comunicado_usuarios (comunicado_id, usuario_id) VALUES ?", [usuarioIds.map((id) => [c.insertId, id])]);
    }
    const destinos = cursoIds.length + usuarioIds.length;
    await registrarAuditoria(req.usuarioId, "comunicado", { titulo, alcance, destinos }, conn);
    await conn.commit();
    res.status(201).json({ id: c.insertId });
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
});

// Sin body. Auth: enviar_comunicados. Últimos 50 comunicados con cantidad de destinos y lecturas.
// 200 [{ id, titulo, mensaje, alcance, fecha, destinos, lecturas }]
router.post("/comunicados/enviados", ...enviar, async (req, res) => {
  const [rows] = await pool.query(
    `SELECT c.id, c.titulo, c.mensaje, c.alcance, DATE_FORMAT(c.creado_en, '%Y-%m-%d %H:%i') AS fecha,
            DATE_FORMAT(c.editado_en, '%Y-%m-%d %H:%i') AS editado,
            ((SELECT COUNT(*) FROM comunicado_cursos d WHERE d.comunicado_id = c.id)
             + (SELECT COUNT(*) FROM comunicado_usuarios d WHERE d.comunicado_id = c.id)) AS destinos,
            (SELECT COUNT(*) FROM comunicado_lecturas l WHERE l.comunicado_id = c.id) AS lecturas
     FROM comunicados c ORDER BY c.creado_en DESC LIMIT 50`);
  res.json(rows);
});

// Body: { id }. Auth: enviar_comunicados. Borra el comunicado (y en cascada destinos y lecturas).
// 200 { ok } | 400 Id inválido | 404 Comunicado no encontrado
router.post("/comunicados/eliminar", ...enviar, async (req, res) => {
  const id = Number(req.body.id);
  if (!Number.isInteger(id) || id < 1) return res.status(400).json({ error: "Id inválido" });
  const [r] = await pool.query("DELETE FROM comunicados WHERE id = ?", [id]);
  if (!r.affectedRows) return res.status(404).json({ error: "Comunicado no encontrado" });
  res.json({ ok: true });
});

// Body: { id, titulo, mensaje }. Auth: enviar_comunicados. Edita título y mensaje y guarda la fecha de edición.
// 200 { ok } | 400 Datos inválidos | 404 Comunicado no encontrado
router.post("/comunicados/editar", ...enviar, async (req, res) => {
  const id = Number(req.body.id);
  const titulo = String(req.body.titulo ?? "").trim();
  const mensaje = String(req.body.mensaje ?? "").trim();
  if (!Number.isInteger(id) || id < 1) return res.status(400).json({ error: "Id inválido" });
  const errorTexto = errorTextoComunicado(titulo, mensaje);
  if (errorTexto) return res.status(400).json({ error: errorTexto });
  if (!titulo || !mensaje) return res.status(400).json({ error: "El título y el mensaje son obligatorios" });

  const [r] = await pool.query(
    "UPDATE comunicados SET titulo = ?, mensaje = ?, editado_en = NOW() WHERE id = ?",
    [titulo, mensaje, id]
  );
  if (!r.affectedRows) return res.status(404).json({ error: "Comunicado no encontrado" });
  await registrarAuditoria(req.usuarioId, "comunicado_editado", { id, titulo });
  res.json({ ok: true });
});

// Notificaciones del usuario logueado: globales, de su curso (alumno) o de los cursos donde dicta
// (profesor) y las dirigidas a él.
router.post("/comunicados/mios", verificarToken, async (req, res) => {
  const [rows] = await pool.query(
    `SELECT c.id, c.titulo, c.mensaje, c.alcance, DATE_FORMAT(c.creado_en, '%Y-%m-%d %H:%i') AS fecha,
            DATE_FORMAT(c.editado_en, '%Y-%m-%d %H:%i') AS editado,
            a.nombre AS autor, (l.usuario_id IS NOT NULL) AS leido
     FROM comunicados c
     LEFT JOIN usuarios a ON a.id = c.autor_id
     LEFT JOIN comunicado_lecturas l ON l.comunicado_id = c.id AND l.usuario_id = ?
     WHERE c.alcance = 'global'
        OR EXISTS (SELECT 1 FROM comunicado_usuarios x WHERE x.comunicado_id = c.id AND x.usuario_id = ?)
        OR EXISTS (SELECT 1 FROM comunicado_cursos x WHERE x.comunicado_id = c.id
             AND (x.curso_id = (SELECT curso_id FROM usuarios WHERE id = ?)
                  OR x.curso_id IN (SELECT curso_id FROM dictados WHERE profesor_id = ?)))
     ORDER BY c.creado_en DESC LIMIT 100`,
    [req.usuarioId, req.usuarioId, req.usuarioId, req.usuarioId]
  );
  res.json(rows.map((r) => ({ ...r, leido: !!r.leido })));
});

// Body: { id }
router.post("/comunicados/leer", verificarToken, async (req, res) => {
  const id = Number(req.body.id);
  if (!Number.isInteger(id) || id < 1) return res.status(400).json({ error: "Id inválido" });
  await pool.query("INSERT IGNORE INTO comunicado_lecturas (comunicado_id, usuario_id) VALUES (?, ?)", [id, req.usuarioId]);
  res.json({ ok: true });
});

export default router;
