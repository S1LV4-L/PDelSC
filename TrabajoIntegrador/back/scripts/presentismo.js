import pool from "../db.js";

// Presentismo por alumno y dictado. Todos los filtros son opcionales.
// Una clase sin registro del alumno cuenta como ausente (igual que /estadisticas).
export async function presentismoAlumnos({
  cursoId = null, materiaId = null, dictadoId = null, alumnoId = null, desde = null, hasta = null,
} = {}) {
  const [rows] = await pool.query(
    `SELECT u.id AS alumno_id, u.nombre, d.id AS dictado_id, m.nombre AS materia, c.anio, c.division,
            COUNT(q.id) AS clases,
            CAST(COALESCE(SUM(a.estado = 'presente'), 0) AS UNSIGNED) AS presentes,
            COUNT(j.id) AS justificadas,
            ROUND(100 * COALESCE(SUM(a.estado = 'presente'), 0) / NULLIF(COUNT(q.id), 0), 1) AS porcentaje
     FROM inscripciones i
     JOIN usuarios u ON u.id = i.alumno_id
     JOIN dictados d ON d.id = i.dictado_id
     JOIN materias m ON m.id = d.materia_id
     JOIN cursos c ON c.id = d.curso_id
     LEFT JOIN clases_qr q ON q.dictado_id = d.id
          AND q.fecha >= COALESCE(?, '1000-01-01') AND q.fecha <= COALESCE(?, '9999-12-31')
     LEFT JOIN asistencias a ON a.clase_id = q.id AND a.alumno_id = u.id
     LEFT JOIN justificaciones j ON j.asistencia_id = a.id AND a.estado = 'ausente' AND j.estado = 'aprobada'
     WHERE u.oculto_en IS NULL AND (? IS NULL OR d.curso_id = ?) AND (? IS NULL OR d.materia_id = ?)
       AND (? IS NULL OR d.id = ?) AND (? IS NULL OR u.id = ?)
     GROUP BY u.id, u.nombre, d.id, m.nombre, c.anio, c.division
     ORDER BY c.anio, c.division, m.nombre, u.nombre`,
    [desde, hasta, cursoId, cursoId, materiaId, materiaId, dictadoId, dictadoId, alumnoId, alumnoId]
  );
  return rows.map((r) => ({ ...r, porcentaje: r.porcentaje === null ? null : Number(r.porcentaje) }));
}
