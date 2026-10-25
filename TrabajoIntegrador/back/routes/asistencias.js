import { Router } from "express";
import crypto from "crypto";
import pool from "../db.js";
import {
  verificarToken,
  verificarPermiso,
  verificarProfesorDelDictado,
} from "../scripts/auth.js";
import { crearPayloadQr, VENTANA_QR_SEG, EXPIRA } from "../scripts/qrFirmado.js";
import { registrarAuditoria, etiquetaDictado } from "../scripts/auditoria.js";

const router = Router();
const DURACIONES = [15, 30, 60];

// ---------- Profesor ----------

// Body: { dictadoId, duracion, reemplazar? }
// Si ya hay un QR hoy y no viene reemplazar: true, responde 409 con requiereConfirmacion.
// Con reemplazar: true se borra el QR del día (y sus asistencias y notas) y se genera uno nuevo.
router.post("/asistencias/generar-qr", verificarToken, verificarPermiso("generar_qr"), verificarProfesorDelDictado,
  async (req, res) => {
    const duracion = Number(req.body.duracion);
    if (!DURACIONES.includes(duracion)) {
      return res.status(400).json({ error: "La duración debe ser 15, 30 o 60 minutos" });
    }
    const reemplazar = req.body.reemplazar === true;
    const token = crypto.randomBytes(24).toString("hex");

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const [existente] = await conn.query(
        "SELECT id FROM clases_qr WHERE dictado_id = ? AND fecha = CURDATE() FOR UPDATE",
        [req.dictadoId]
      );
      if (existente.length && !reemplazar) {
        await conn.rollback();
        return res.status(409).json({
          error: "Ya generaste el QR de hoy. Volver a generarlo sobrescribirá las asistencias",
          requiereConfirmacion: true,
        });
      }
      // Las asistencias del QR anterior se borran en cascada
      if (existente.length) await conn.query("DELETE FROM clases_qr WHERE id = ?", [existente[0].id]);

      if (existente.length) {
        await registrarAuditoria(
          req.usuarioId,
          "qr_regenerado",
          { dictadoId: req.dictadoId, dictado: await etiquetaDictado(req.dictadoId, conn) },
          conn
        );
      }

      const [r] = await conn.query(
        `INSERT INTO clases_qr (dictado_id, fecha, hora_inicio, token, duracion_min)
         VALUES (?, CURDATE(), CURTIME(), ?, ?)`,
        [req.dictadoId, token, duracion]
      );
      await conn.query(
        `INSERT INTO asistencias (clase_id, alumno_id, estado)
         SELECT ?, alumno_id, 'ausente' FROM inscripciones WHERE dictado_id = ?`,
        [r.insertId, req.dictadoId]
      );
      await conn.commit();

      const [[clase]] = await pool.query(
        `SELECT id, duracion_min,
                GREATEST(0, TIMESTAMPDIFF(SECOND, NOW(), ${EXPIRA})) AS segundos_restantes
        FROM clases_qr WHERE id = ?`, [r.insertId]);
      res.status(201).json({ ...clase, reemplazado: existente.length > 0 });
    } catch (e) {
      await conn.rollback();
      if (e.code === "ER_DUP_ENTRY") {
        return res.status(409).json({
          error: "Ya generaste el QR de hoy. Volver a generarlo sobrescribirá las asistencias",
          requiereConfirmacion: true,
        });
      }
      throw e;
    } finally {
      conn.release();
    }
  });

// Body: { dictadoId }. Estado de la toma de hoy (sin el token: el QR se pide firmado en /qr-dinamico)
router.post("/asistencias/qr-hoy", verificarToken, verificarPermiso("generar_qr"), verificarProfesorDelDictado,
  async (req, res) => {
    const [[clase]] = await pool.query(
        `SELECT id, duracion_min,
                GREATEST(0, TIMESTAMPDIFF(SECOND, NOW(), ${EXPIRA})) AS segundos_restantes
        FROM clases_qr WHERE dictado_id = ? AND fecha = CURDATE()`,
        [req.dictadoId]
      );
    res.json(clase ?? null);
  });

// Body: { dictadoId }. Todos los alumnos inscriptos con su estado de HOY.
// estado y asistencia_id son null mientras no se haya generado el QR del día.
router.post("/asistencias/alumnos", verificarToken, verificarPermiso("ver_asistencia"), verificarProfesorDelDictado,
  async (req, res) => {
    const [rows] = await pool.query(
      `SELECT u.id AS alumno_id, u.nombre, a.id AS asistencia_id, a.estado, a.nota
       FROM inscripciones i
       JOIN usuarios u ON u.id = i.alumno_id
       LEFT JOIN clases_qr c ON c.dictado_id = i.dictado_id AND c.fecha = CURDATE()
       LEFT JOIN asistencias a ON a.clase_id = c.id AND a.alumno_id = i.alumno_id
       WHERE i.dictado_id = ?
       ORDER BY u.nombre`,
      [req.dictadoId]
    );
    res.json(rows);
  });

// Body: { dictadoId, alumnoId }. Historial de un alumno en el dictado (una fila por clase dada).
// id es el id de la asistencia (para /asistencias/nota); es null si el alumno no tiene registro en esa clase.
router.post("/asistencias/historial-alumno", verificarToken, verificarPermiso("ver_asistencia"), verificarProfesorDelDictado,
  async (req, res) => {
    const alumnoId = Number(req.body.alumnoId);
    if (!Number.isInteger(alumnoId) || alumnoId < 1) {
      return res.status(400).json({ error: "alumnoId es obligatorio" });
    }

    const [alumno] = await pool.query(
      `SELECT u.nombre FROM inscripciones i JOIN usuarios u ON u.id = i.alumno_id
       WHERE i.dictado_id = ? AND i.alumno_id = ?`,
      [req.dictadoId, alumnoId]
    );
    if (alumno.length === 0) return res.status(404).json({ error: "El alumno no cursa esta materia" });

    const [asistencias] = await pool.query(
      `SELECT a.id, DATE_FORMAT(c.fecha, '%Y-%m-%d') AS fecha, COALESCE(a.estado, 'ausente') AS estado, a.nota
       FROM clases_qr c
       LEFT JOIN asistencias a ON a.clase_id = c.id AND a.alumno_id = ?
       WHERE c.dictado_id = ?
       ORDER BY fecha DESC`,
      [alumnoId, req.dictadoId]
    );
    res.json({ alumno: { id: alumnoId, nombre: alumno[0].nombre }, asistencias });
  });

// Body: { dictadoId, fecha? } con fecha YYYY-MM-DD (por defecto hoy). Alumnos con presente/ausente de esa clase
router.post("/asistencias/lista", verificarToken, verificarPermiso("ver_asistencia"), verificarProfesorDelDictado,
  async (req, res) => {
    const fecha = req.body.fecha || null;
    if (fecha && !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
      return res.status(400).json({ error: "La fecha debe tener formato YYYY-MM-DD" });
    }
    const [rows] = await pool.query(
      `SELECT a.id, u.id AS alumno_id, u.nombre, a.estado, a.nota
       FROM clases_qr c
       JOIN asistencias a ON a.clase_id = c.id
       JOIN usuarios u ON u.id = a.alumno_id
       WHERE c.dictado_id = ? AND c.fecha = COALESCE(?, CURDATE())
       ORDER BY u.nombre`,
      [req.dictadoId, fecha]
    );
    res.json(rows);
  });

// Body: { id, nota }. Nota breve en una ausencia (id = id de la fila de asistencia)
router.post("/asistencias/nota", verificarToken, verificarPermiso("ver_asistencia"), async (req, res) => {
  const id = Number(req.body.id);
  if (!Number.isInteger(id) || id < 1) return res.status(400).json({ error: "Id inválido" });

  const nota = String(req.body.nota ?? "").trim().slice(0, 255) || null;
  const [r] = await pool.query(
    `UPDATE asistencias a
     JOIN clases_qr c ON c.id = a.clase_id
     JOIN dictados d ON d.id = c.dictado_id AND d.profesor_id = ?
     SET a.nota = ?
     WHERE a.id = ? AND a.estado = 'ausente'`,
    [req.usuarioId, nota, id]
  );
  if (!r.affectedRows) return res.status(404).json({ error: "Ausencia no encontrada" });
  res.json({ ok: true });
});

// Body: { dictadoId }. QR firmado que vale 20 s. El front lo vuelve a pedir cada 20 s.
router.post("/asistencias/qr-dinamico", verificarToken, verificarPermiso("generar_qr"), verificarProfesorDelDictado,
  async (req, res) => {
    const [[clase]] = await pool.query(
      `SELECT token, GREATEST(0, TIMESTAMPDIFF(SECOND, NOW(), ${EXPIRA})) AS segundos_restantes
       FROM clases_qr WHERE dictado_id = ? AND fecha = CURDATE()`,
      [req.dictadoId]
    );
    if (!clase || clase.segundos_restantes === 0) {
      return res.json({ payload: null, segundos_restantes: 0, ventana: VENTANA_QR_SEG });
    }
    res.json({
      payload: crearPayloadQr(clase.token),
      segundos_restantes: clase.segundos_restantes,
      ventana: VENTANA_QR_SEG,
    });
  });

// Body: { dictadoId }. Cierra la toma de hoy: el QR deja de valer. Sin cambios de esquema:
// con hora_inicio a medianoche, fecha + hora_inicio + duración (máx. 60 min) ya pasó.
router.post("/asistencias/cerrar", verificarToken, verificarPermiso("generar_qr"), verificarProfesorDelDictado,
  async (req, res) => {
    const [r] = await pool.query(
      "UPDATE clases_qr SET hora_inicio = '00:00:00' WHERE dictado_id = ? AND fecha = CURDATE()",
      [req.dictadoId]
    );
    if (!r.affectedRows) return res.status(404).json({ error: "Hoy no hay una toma abierta" });
    res.json({ ok: true });
  });

// Body: { dictadoId, alumnoId }. Marca presente a mano (sin celular, sin batería, cámara rota...)
router.post("/asistencias/marcar-manual", verificarToken, verificarPermiso("marcar_manual"), verificarProfesorDelDictado,
  async (req, res) => {
    const alumnoId = Number(req.body.alumnoId);
    if (!Number.isInteger(alumnoId) || alumnoId < 1) {
      return res.status(400).json({ error: "alumnoId es obligatorio" });
    }
    const [[alumno]] = await pool.query(
      `SELECT u.nombre FROM inscripciones i JOIN usuarios u ON u.id = i.alumno_id
       WHERE i.dictado_id = ? AND i.alumno_id = ?`,
      [req.dictadoId, alumnoId]
    );
    if (!alumno) return res.status(404).json({ error: "El alumno no cursa esta materia" });

    const [[clase]] = await pool.query(
      "SELECT id FROM clases_qr WHERE dictado_id = ? AND fecha = CURDATE()", [req.dictadoId]);
    if (!clase) return res.status(409).json({ error: "Primero genera el QR de hoy" });

    await pool.query(
      `INSERT INTO asistencias (clase_id, alumno_id, estado) VALUES (?, ?, 'presente')
       ON DUPLICATE KEY UPDATE estado = 'presente', nota = NULL`,
      [clase.id, alumnoId]
    );
    await registrarAuditoria(req.usuarioId, "asistencia_manual", {
      origen: "profesor",
      alumno: alumno.nombre,
      alumnoId,
      dictado: await etiquetaDictado(req.dictadoId),
    });
    res.json({ ok: true });
  });

export default router;
