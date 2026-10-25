// routes/estadisticas.js: presentismo por materia (profesor) y por dictado (administrador)
import { Router } from "express";
import pool from "../db.js";
import { verificarToken, verificarPermiso, verificarProfesorDelDictado } from "../scripts/auth.js";
import { presentismoAlumnos } from "../scripts/presentismo.js";

const router = Router();

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
