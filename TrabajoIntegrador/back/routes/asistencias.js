import { Router } from "express";
import crypto from "crypto";
import pool from "../db.js";
import {
  verificarToken,
  verificarPermiso,
  verificarProfesorDelDictado,
  verificarAlumnoDelDictado,
  alumnoCursaDictado,
} from "../scripts/auth.js";
import { crearPayloadQr, leerPayloadQr, VENTANA_QR_SEG } from "../scripts/qrFirmado.js";
import { registrarAuditoria, etiquetaDictado } from "../scripts/auditoria.js";
import { presentismoAlumnos } from "../scripts/presentismo.js";

const router = Router();
const DURACIONES = [15, 30, 60];
const EXPIRA = "TIMESTAMP(fecha, hora_inicio) + INTERVAL duracion_min MINUTE";

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

// Body: { dictadoId, umbral? }. Presentismo por clase y por alumno + alumnos en riesgo
router.post("/estadisticas/materia", verificarToken, verificarPermiso("ver_asistencia"), verificarProfesorDelDictado,
  async (req, res) => {
    const umbral = Number(req.body.umbral) || 75;
    const [porClase] = await pool.query(
      `SELECT DATE_FORMAT(q.fecha, '%Y-%m-%d') AS fecha,
              COUNT(i.alumno_id) AS total,
              CAST(COALESCE(SUM(a.estado = 'presente'), 0) AS UNSIGNED) AS presentes
       FROM clases_qr q
       JOIN inscripciones i ON i.dictado_id = q.dictado_id
       LEFT JOIN asistencias a ON a.clase_id = q.id AND a.alumno_id = i.alumno_id
       WHERE q.dictado_id = ?
       GROUP BY q.id, q.fecha ORDER BY q.fecha DESC`,
      [req.dictadoId]
    );
    const porAlumno = await presentismoAlumnos({ dictadoId: req.dictadoId });
    res.json({
      umbral,
      porClase: porClase.map((c) => ({
        ...c,
        porcentaje: c.total ? Math.round((100 * c.presentes) / c.total) : 0,
      })),
      porAlumno,
      enRiesgo: porAlumno
        .filter((a) => a.clases > 0 && a.porcentaje < umbral)
        .sort((a, b) => a.porcentaje - b.porcentaje),
    });
  });

// ---------- Alumno ----------

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

// ---------- Estadísticas (admin) ----------

router.post("/estadisticas/dictados", verificarToken, verificarPermiso("ver_estadisticas"), async (req, res) => {
  const [rows] = await pool.query(
    `SELECT d.id, m.nombre AS materia, c.anio, c.division,
       COUNT(DISTINCT q.id) AS clases,
       CAST(COALESCE(SUM(a.estado = 'presente'), 0) AS UNSIGNED) AS presentes,
       CAST(COALESCE(SUM(a.estado = 'ausente'), 0) AS UNSIGNED) AS ausentes,
       ROUND(100 * SUM(a.estado = 'presente') / NULLIF(COUNT(a.id), 0), 1) AS porcentaje_presentismo
     FROM dictados d
     JOIN materias m ON m.id = d.materia_id
     JOIN cursos c ON c.id = d.curso_id
     LEFT JOIN clases_qr q ON q.dictado_id = d.id
     LEFT JOIN asistencias a ON a.clase_id = q.id
     GROUP BY d.id, m.nombre, c.anio, c.division
     ORDER BY c.anio, c.division, m.nombre`
  );
  res.json(rows);
});

// Body: { dictadoId }. Presentismo de cada alumno inscripto en el dictado
router.post("/estadisticas/dictados/alumnos", verificarToken, verificarPermiso("ver_estadisticas"), async (req, res) => {
  const dictadoId = Number(req.body.dictadoId);
  if (!Number.isInteger(dictadoId) || dictadoId < 1) return res.status(400).json({ error: "dictadoId es obligatorio" });

  const [rows] = await pool.query(
    `SELECT u.id, u.nombre,
       COUNT(q.id) AS clases,
       CAST(COALESCE(SUM(a.estado = 'presente'), 0) AS UNSIGNED) AS presentes,
       COUNT(q.id) - CAST(COALESCE(SUM(a.estado = 'presente'), 0) AS UNSIGNED) AS ausentes,
       ROUND(100 * COALESCE(SUM(a.estado = 'presente'), 0) / NULLIF(COUNT(q.id), 0), 1) AS porcentaje_presentismo
     FROM inscripciones i
     JOIN usuarios u ON u.id = i.alumno_id
     LEFT JOIN clases_qr q ON q.dictado_id = i.dictado_id
     LEFT JOIN asistencias a ON a.clase_id = q.id AND a.alumno_id = u.id
     WHERE i.dictado_id = ?
     GROUP BY u.id, u.nombre
     ORDER BY u.nombre`,
    [dictadoId]
  );
  res.json(rows);
});

export default router;