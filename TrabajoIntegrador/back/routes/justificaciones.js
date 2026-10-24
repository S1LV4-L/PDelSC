// routes/justificaciones.js: pedidos del alumno, resolución del preceptor y correcciones manuales
import { Router } from "express";
import pool from "../db.js";
import { verificarToken, verificarPermiso } from "../scripts/auth.js";
import { obtenerPermisos } from "../scripts/helpers.js";
import { registrarAuditoria, etiquetaDictado } from "../scripts/auditoria.js";

const router = Router();
const MIMES = ["image/jpeg", "image/png", "image/webp"];
const MAX_ADJUNTO = 4 * 1024 * 1024;
const admin = [verificarToken, verificarPermiso("corregir_asistencias")];
const entero = (v) => {
  const n = Number(v);
  return Number.isInteger(n) && n > 0 ? n : null;
};

// ---------- Alumno ----------

// Body: { asistenciaId, motivo, adjuntoBase64?, adjuntoMime? }
router.post("/justificaciones/pedir", verificarToken, verificarPermiso("pedir_justificacion"), async (req, res) => {
  const asistenciaId = entero(req.body.asistenciaId);
  const motivo = String(req.body.motivo ?? "").trim().slice(0, 500);
  if (!asistenciaId || motivo.length < 5) {
    return res.status(400).json({ error: "Indica el motivo (mínimo 5 caracteres)" });
  }

  let adjunto = null;
  let mime = null;
  if (req.body.adjuntoBase64) {
    mime = String(req.body.adjuntoMime ?? "");
    if (!MIMES.includes(mime)) return res.status(400).json({ error: "La imagen debe ser JPG, PNG o WEBP" });
    adjunto = Buffer.from(String(req.body.adjuntoBase64), "base64");
    if (!adjunto.length || adjunto.length > MAX_ADJUNTO) {
      return res.status(400).json({ error: "La imagen debe pesar menos de 4 MB" });
    }
  }

  const [[asistencia]] = await pool.query(
    "SELECT id, estado FROM asistencias WHERE id = ? AND alumno_id = ?", [asistenciaId, req.usuarioId]);
  if (!asistencia) return res.status(404).json({ error: "Falta no encontrada" });
  if (asistencia.estado !== "ausente") return res.status(400).json({ error: "Solo se justifican ausencias" });

  const [[previa]] = await pool.query("SELECT id, estado FROM justificaciones WHERE asistencia_id = ?", [asistenciaId]);
  if (previa && previa.estado !== "rechazada") {
    return res.status(409).json({ error: `Esa falta ya tiene una justificación ${previa.estado}` });
  }

  if (previa) {
    await pool.query(
      `UPDATE justificaciones SET motivo = ?, adjunto = ?, adjunto_mime = ?, estado = 'pendiente',
              respuesta = NULL, resuelta_por = NULL, resuelta_en = NULL, creada_en = NOW()
       WHERE id = ?`,
      [motivo, adjunto, mime, previa.id]
    );
  } else {
    await pool.query(
      "INSERT INTO justificaciones (asistencia_id, alumno_id, motivo, adjunto, adjunto_mime) VALUES (?, ?, ?, ?, ?)",
      [asistenciaId, req.usuarioId, motivo, adjunto, mime]
    );
  }
  res.status(201).json({ ok: true });
});

router.post("/justificaciones/mias", verificarToken, verificarPermiso("pedir_justificacion"), async (req, res) => {
  const [rows] = await pool.query(
    `SELECT j.id, j.asistencia_id, DATE_FORMAT(q.fecha, '%Y-%m-%d') AS fecha, m.nombre AS materia,
            c.anio, c.division, j.motivo, j.estado, j.respuesta, (j.adjunto IS NOT NULL) AS tiene_adjunto
     FROM justificaciones j
     JOIN asistencias a ON a.id = j.asistencia_id
     JOIN clases_qr q ON q.id = a.clase_id
     JOIN dictados d ON d.id = q.dictado_id
     JOIN materias m ON m.id = d.materia_id
     JOIN cursos c ON c.id = d.curso_id
     WHERE j.alumno_id = ?
     ORDER BY q.fecha DESC, j.id DESC`,
    [req.usuarioId]
  );
  res.json(rows.map((r) => ({ ...r, tiene_adjunto: !!r.tiene_adjunto })));
});

// Body: { id }. El certificado lo ve su dueño o el preceptor
router.post("/justificaciones/adjunto", verificarToken, async (req, res) => {
  const id = entero(req.body.id);
  if (!id) return res.status(400).json({ error: "Id inválido" });
  const [[j]] = await pool.query("SELECT alumno_id, adjunto, adjunto_mime FROM justificaciones WHERE id = ?", [id]);
  if (!j?.adjunto) return res.status(404).json({ error: "No hay imagen adjunta" });

  const permisos = await obtenerPermisos(req.usuarioId);
  if (j.alumno_id !== req.usuarioId && !permisos.includes("corregir_asistencias")) {
    return res.status(403).json({ error: "No tenés permiso para ver esta imagen" });
  }
  res.json({ mime: j.adjunto_mime, base64: j.adjunto.toString("base64") });
});

// ---------- Administrador: resolver pedidos ----------

// Body: { estado? } (por defecto "pendiente")
router.post("/justificaciones/pendientes", ...admin, async (req, res) => {
  const estado = ["pendiente", "aprobada", "rechazada"].includes(req.body.estado) ? req.body.estado : "pendiente";
  const [rows] = await pool.query(
    `SELECT j.id, j.asistencia_id, DATE_FORMAT(q.fecha, '%Y-%m-%d') AS fecha, u.nombre AS alumno,
            m.nombre AS materia, c.anio, c.division, j.motivo, j.estado, j.respuesta,
            (j.adjunto IS NOT NULL) AS tiene_adjunto
     FROM justificaciones j
     JOIN usuarios u ON u.id = j.alumno_id
     JOIN asistencias a ON a.id = j.asistencia_id
     JOIN clases_qr q ON q.id = a.clase_id
     JOIN dictados d ON d.id = q.dictado_id
     JOIN materias m ON m.id = d.materia_id
     JOIN cursos c ON c.id = d.curso_id
     WHERE j.estado = ?
     ORDER BY j.creada_en DESC LIMIT 200`,
    [estado]
  );
  res.json(rows.map((r) => ({ ...r, tiene_adjunto: !!r.tiene_adjunto })));
});

// Body: { id, aprobar: boolean, respuesta? }
router.post("/justificaciones/resolver", ...admin, async (req, res) => {
  const id = entero(req.body.id);
  if (!id || typeof req.body.aprobar !== "boolean") return res.status(400).json({ error: "id y aprobar son obligatorios" });
  const respuesta = String(req.body.respuesta ?? "").trim().slice(0, 255) || null;
  const estado = req.body.aprobar ? "aprobada" : "rechazada";

  const [r] = await pool.query(
    `UPDATE justificaciones SET estado = ?, respuesta = ?, resuelta_por = ?, resuelta_en = NOW()
     WHERE id = ? AND estado = 'pendiente'`,
    [estado, respuesta, req.usuarioId, id]
  );
  if (!r.affectedRows) return res.status(404).json({ error: "El pedido no existe o ya fue resuelto" });

  const [[info]] = await pool.query(
    "SELECT u.nombre FROM justificaciones j JOIN usuarios u ON u.id = j.alumno_id WHERE j.id = ?", [id]);
  await registrarAuditoria(req.usuarioId, "justificacion", { resultado: estado, alumno: info?.nombre, justificacionId: id, respuesta });
  res.json({ ok: true });
});

// ---------- Administrador: corregir asistencias ----------

// Body: { dictadoId }. Fechas con clase (más recientes primero)
router.post("/admin/asistencias/clases", ...admin, async (req, res) => {
  const dictadoId = entero(req.body.dictadoId);
  if (!dictadoId) return res.status(400).json({ error: "dictadoId es obligatorio" });
  const [rows] = await pool.query(
    "SELECT DATE_FORMAT(fecha, '%Y-%m-%d') AS fecha FROM clases_qr WHERE dictado_id = ? ORDER BY fecha DESC LIMIT 60",
    [dictadoId]
  );
  res.json(rows.map((r) => r.fecha));
});

// Body: { dictadoId, fecha: "YYYY-MM-DD" }
router.post("/admin/asistencias/lista", ...admin, async (req, res) => {
  const dictadoId = entero(req.body.dictadoId);
  const fecha = String(req.body.fecha ?? "");
  if (!dictadoId || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return res.status(400).json({ error: "dictadoId y fecha son obligatorios" });
  const [rows] = await pool.query(
    `SELECT a.id AS asistencia_id, u.id AS alumno_id, u.nombre, a.estado, j.estado AS justificacion, j.motivo
     FROM clases_qr c
     JOIN asistencias a ON a.clase_id = c.id
     JOIN usuarios u ON u.id = a.alumno_id
     LEFT JOIN justificaciones j ON j.asistencia_id = a.id
     WHERE c.dictado_id = ? AND c.fecha = ? ORDER BY u.nombre`,
    [dictadoId, fecha]
  );
  res.json(rows);
});

async function datosAsistencia(asistenciaId) {
  const [[a]] = await pool.query(
    `SELECT a.id, a.estado, a.alumno_id, u.nombre, q.dictado_id, DATE_FORMAT(q.fecha, '%Y-%m-%d') AS fecha
     FROM asistencias a JOIN usuarios u ON u.id = a.alumno_id JOIN clases_qr q ON q.id = a.clase_id
     WHERE a.id = ?`,
    [asistenciaId]
  );
  return a;
}

// Body: { asistenciaId }
router.post("/admin/asistencias/marcar-presente", ...admin, async (req, res) => {
  const asistenciaId = entero(req.body.asistenciaId);
  if (!asistenciaId) return res.status(400).json({ error: "asistenciaId es obligatorio" });
  const a = await datosAsistencia(asistenciaId);
  if (!a) return res.status(404).json({ error: "Asistencia no encontrada" });

  await pool.query("UPDATE asistencias SET estado = 'presente', nota = NULL WHERE id = ?", [asistenciaId]);
  await registrarAuditoria(req.usuarioId, "asistencia_manual", {
    origen: "administrador",
    alumno: a.nombre,
    alumnoId: a.alumno_id,
    dictado: await etiquetaDictado(a.dictado_id),
    fecha: a.fecha,
    estadoAnterior: a.estado,
  });
  res.json({ ok: true });
});

// Body: { asistenciaId, motivo }. Justifica una falta (queda aprobada y a nombre de quien la cargó)
router.post("/admin/asistencias/justificar", ...admin, async (req, res) => {
  const asistenciaId = entero(req.body.asistenciaId);
  const motivo = String(req.body.motivo ?? "").trim().slice(0, 500);
  if (!asistenciaId || motivo.length < 5) return res.status(400).json({ error: "Indica el motivo (mínimo 5 caracteres)" });
  const a = await datosAsistencia(asistenciaId);
  if (!a) return res.status(404).json({ error: "Asistencia no encontrada" });
  if (a.estado !== "ausente") return res.status(400).json({ error: "Solo se justifican ausencias" });

  await pool.query(
    `INSERT INTO justificaciones (asistencia_id, alumno_id, motivo, estado, respuesta, resuelta_por, resuelta_en)
     VALUES (?, ?, ?, 'aprobada', 'Cargada por preceptoría', ?, NOW())
     ON DUPLICATE KEY UPDATE motivo = VALUES(motivo), estado = 'aprobada',
       respuesta = 'Cargada por preceptoría', resuelta_por = VALUES(resuelta_por), resuelta_en = NOW()`,
    [asistenciaId, a.alumno_id, motivo, req.usuarioId]
  );
  await registrarAuditoria(req.usuarioId, "justificacion", {
    resultado: "aprobada",
    origen: "administrador",
    alumno: a.nombre,
    dictado: await etiquetaDictado(a.dictado_id),
    fecha: a.fecha,
    motivo,
  });
  res.json({ ok: true });
});

export default router;