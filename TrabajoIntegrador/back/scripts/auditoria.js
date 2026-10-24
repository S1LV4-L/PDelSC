import pool from "../db.js";

export async function registrarAuditoria(usuarioId, accion, detalle = null, conn = pool) {
  await conn.query(
    "INSERT INTO auditoria (usuario_id, accion, detalle) VALUES (?, ?, ?)",
    [usuarioId, accion, detalle ? JSON.stringify(detalle) : null]
  );
}

export async function etiquetaDictado(dictadoId, conn = pool) {
  const [[r]] = await conn.query(
    `SELECT m.nombre AS materia, c.anio, c.division
     FROM dictados d JOIN materias m ON m.id = d.materia_id JOIN cursos c ON c.id = d.curso_id
     WHERE d.id = ?`,
    [dictadoId]
  );
  return r ? `${r.materia} · ${r.anio}°${r.division}°` : `Dictado ${dictadoId}`;
}