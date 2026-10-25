// routes/asistenciasAlumno.js: escaneo de QR, historial y resumen del alumno
import { Router } from "express";
import pool from "../db.js";
import { verificarToken, verificarPermiso, verificarAlumnoDelDictado, alumnoCursaDictado } from "../scripts/auth.js";
import { leerPayloadQr, EXPIRA } from "../scripts/qrFirmado.js";
import { presentismoAlumnos } from "../scripts/presentismo.js";

const router = Router();

router.post("/asistencias/escanear", verificarToken, verificarPermiso("leer_qr"), async (req, res) => {
  const leido = leerPayloadQr(req.body.token);
  if (leido.error) return res.status(leido.status).json({ error: leido.error });

  const [[clase]] = await pool.query(
    `SELECT id, dictado_id, ${EXPIRA} > NOW() AS vigente FROM clases_qr WHERE token = ?`, [leido.token]);
  if (!clase) return res.status(404).json({ error: "QR inválido" });
  if (!clase.vigente) return res.status(410).json({ error: "La toma de asistencia ya está cerrada o venció" });

  if (!(await alumnoCursaDictado(req.usuarioId, clase.dictado_id))) {
    return res.status(403).json({ error: "No cursás esta materia" });
  }

  await pool.query(
    `INSERT INTO asistencias (clase_id, alumno_id, estado) VALUES (?, ?, 'presente')
     ON DUPLICATE KEY UPDATE estado = 'presente', nota = NULL`,
    [clase.id, req.usuarioId]
  );
  res.json({ ok: true, dictado_id: clase.dictado_id });
});

// Body: { dictadoId }. Historial del alumno en una materia (una fila por clase dada)
router.post("/asistencias/historial", verificarToken, verificarPermiso("leer_qr"), verificarAlumnoDelDictado,
  async (req, res) => {
    const [rows] = await pool.query(
      `SELECT a.id, DATE_FORMAT(c.fecha, '%Y-%m-%d') AS fecha,
              COALESCE(a.estado, 'ausente') AS estado, a.nota, j.estado AS justificacion
       FROM clases_qr c
       LEFT JOIN asistencias a ON a.clase_id = c.id AND a.alumno_id = ?
       LEFT JOIN justificaciones j ON j.asistencia_id = a.id
       WHERE c.dictado_id = ?
       ORDER BY fecha DESC`,
      [req.usuarioId, req.dictadoId]
    );
    res.json(rows);
  });

// Resumen propio por materia (el global lo suma el front)
router.post("/asistencias/resumen", verificarToken, verificarPermiso("leer_qr"), async (req, res) => {
  const filas = await presentismoAlumnos({ alumnoId: req.usuarioId });
  res.json(filas.map(({ alumno_id, nombre, ...resto }) => resto));
});

// Body: { mes: "YYYY-MM" }. Por día: clases dadas y a cuántas asistió (ej: 2/3)
router.post("/asistencias/calendario", verificarToken, verificarPermiso("leer_qr"), async (req, res) => {
  const mes = String(req.body.mes ?? "");
  if (!/^\d{4}-\d{2}$/.test(mes)) return res.status(400).json({ error: "El mes debe tener formato YYYY-MM" });
  const [rows] = await pool.query(
    `SELECT DATE_FORMAT(q.fecha, '%Y-%m-%d') AS fecha, COUNT(*) AS total,
            CAST(COALESCE(SUM(a.estado = 'presente'), 0) AS UNSIGNED) AS presentes
     FROM inscripciones i
     JOIN clases_qr q ON q.dictado_id = i.dictado_id
     LEFT JOIN asistencias a ON a.clase_id = q.id AND a.alumno_id = i.alumno_id
     WHERE i.alumno_id = ? AND q.fecha >= ? AND q.fecha < DATE_ADD(?, INTERVAL 1 MONTH)
     GROUP BY q.fecha ORDER BY q.fecha`,
    [req.usuarioId, `${mes}-01`, `${mes}-01`]
  );
  res.json(rows);
});

export default router;
