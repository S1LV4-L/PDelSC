// routes/reportes.js: alertas de ausentismo y planillas de asistencia
import { Router } from "express";
import pool from "../db.js";
import { verificarToken, verificarPermiso } from "../scripts/auth.js";
import { presentismoAlumnos } from "../scripts/presentismo.js";

const router = Router();
const idOpcional = (v) => {
  const n = Number(v);
  return Number.isInteger(n) && n > 0 ? n : null;
};
const fechaOpcional = (v) => (/^\d{4}-\d{2}-\d{2}$/.test(String(v ?? "")) ? String(v) : null);
const cursoLabel = (anio, division) => `${anio}°${division}°`;
const dmy = (iso) => iso.split("-").reverse().join("/");

// Body: { umbral?, cursoId?, materiaId? }. Alumnos por debajo del umbral, por materia
router.post("/ausentismo/alertas", verificarToken, verificarPermiso("ver_estadisticas"), async (req, res) => {
  const umbral = Number(req.body.umbral ?? 75);
  if (!(umbral > 0 && umbral <= 100)) return res.status(400).json({ error: "El umbral debe estar entre 1 y 100" });

  const filas = await presentismoAlumnos({
    cursoId: idOpcional(req.body.cursoId),
    materiaId: idOpcional(req.body.materiaId),
  });
  res.json(
    filas
      .filter((f) => f.clases > 0 && f.porcentaje < umbral)
      .sort((a, b) => a.porcentaje - b.porcentaje || a.nombre.localeCompare(b.nombre))
  );
});

// Body: { tipo: "detalle" | "resumen", cursoId?, materiaId?, dictadoId?, alumnoId?, desde?, hasta? }
// Devuelve una tabla lista para exportar: { titulo, subtitulo, columnas, filas }
router.post("/reportes/asistencia", verificarToken, verificarPermiso("ver_reportes"), async (req, res) => {
  const f = {
    cursoId: idOpcional(req.body.cursoId),
    materiaId: idOpcional(req.body.materiaId),
    dictadoId: idOpcional(req.body.dictadoId),
    alumnoId: idOpcional(req.body.alumnoId),
    desde: fechaOpcional(req.body.desde),
    hasta: fechaOpcional(req.body.hasta),
  };
  const subtitulo = f.desde || f.hasta
    ? `Período: ${f.desde ? dmy(f.desde) : "inicio"} al ${f.hasta ? dmy(f.hasta) : "hoy"}`
    : "Todo el ciclo";

  if (req.body.tipo === "resumen") {
    const filas = await presentismoAlumnos(f);
    return res.json({
      titulo: "Resumen de asistencia",
      subtitulo,
      columnas: ["Curso", "Materia", "Alumno", "Clases", "Presentes", "Ausentes", "Justificadas", "% presentismo"],
      filas: filas.map((r) => [
        cursoLabel(r.anio, r.division), r.materia, r.nombre, r.clases, r.presentes,
        r.clases - r.presentes, r.justificadas, r.porcentaje === null ? "" : `${r.porcentaje}%`,
      ]),
    });
  }

  const [rows] = await pool.query(
    `SELECT DATE_FORMAT(q.fecha, '%d/%m/%Y') AS fecha, c.anio, c.division, m.nombre AS materia,
            u.nombre AS alumno, COALESCE(a.estado, 'ausente') AS estado, j.estado AS justificacion, a.nota
     FROM clases_qr q
     JOIN dictados d ON d.id = q.dictado_id
     JOIN materias m ON m.id = d.materia_id
     JOIN cursos c ON c.id = d.curso_id
     JOIN inscripciones i ON i.dictado_id = d.id
     JOIN usuarios u ON u.id = i.alumno_id
     LEFT JOIN asistencias a ON a.clase_id = q.id AND a.alumno_id = u.id
     LEFT JOIN justificaciones j ON j.asistencia_id = a.id
     WHERE (? IS NULL OR d.curso_id = ?) AND (? IS NULL OR d.materia_id = ?)
       AND (? IS NULL OR d.id = ?) AND (? IS NULL OR u.id = ?)
       AND q.fecha >= COALESCE(?, '1000-01-01') AND q.fecha <= COALESCE(?, '9999-12-31')
     ORDER BY q.fecha, c.anio, c.division, m.nombre, u.nombre
     LIMIT 20000`,
    [f.cursoId, f.cursoId, f.materiaId, f.materiaId, f.dictadoId, f.dictadoId, f.alumnoId, f.alumnoId, f.desde, f.hasta]
  );
  res.json({
    titulo: "Planilla de asistencia",
    subtitulo,
    columnas: ["Fecha", "Curso", "Materia", "Alumno", "Estado", "Justificada", "Nota"],
    filas: rows.map((r) => [
      r.fecha, cursoLabel(r.anio, r.division), r.materia, r.alumno,
      r.estado === "presente" ? "Presente" : "Ausente",
      r.estado === "ausente" && r.justificacion === "aprobada" ? "Sí"
        : r.estado === "ausente" && r.justificacion === "pendiente" ? "Pendiente" : "",
      r.nota ?? "",
    ]),
  });
});

export default router;