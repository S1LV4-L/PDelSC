// routes/asistencias.js
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
        `SELECT id, token, duracion_min,
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

// Body: { dictadoId }. QR de hoy (para volver a mostrarlo). Devuelve null si todavía no se generó
router.post("/asistencias/qr-hoy", verificarToken, verificarPermiso("generar_qr"), verificarProfesorDelDictado,
  async (req, res) => {
    const [[clase]] = await pool.query(
        `SELECT id, token, duracion_min,
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

// ---------- Alumno ----------

router.post("/asistencias/escanear", verificarToken, verificarPermiso("leer_qr"), async (req, res) => {
  const token = String(req.body.token ?? "");
  const [[clase]] = await pool.query(
    `SELECT id, dictado_id, ${EXPIRA} > NOW() AS vigente FROM clases_qr WHERE token = ?`, [token]);
  if (!clase) return res.status(404).json({ error: "QR inválido" });
  if (!clase.vigente) return res.status(410).json({ error: "El QR ya expiró" });

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
      `SELECT DATE_FORMAT(c.fecha, '%Y-%m-%d') AS fecha, COALESCE(a.estado, 'ausente') AS estado, a.nota
       FROM clases_qr c
       LEFT JOIN asistencias a ON a.clase_id = c.id AND a.alumno_id = ?
       WHERE c.dictado_id = ?
       ORDER BY fecha DESC`,
      [req.usuarioId, req.dictadoId]
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