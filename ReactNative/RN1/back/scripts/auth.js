import jwt from 'jsonwebtoken';
import pool from '../db.js';

// Verifica que el token sea válido. No exige ningún permiso puntual:
// lo usan tanto rutas de admin como de autoservicio (ej: mi-cuenta, galería).
export function verificarToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Token no provisto' });

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.usuarioId = payload.id;
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido o expirado' });
  }
}

// Exige que el perfil del usuario loggeado tenga un permiso puntual.
// Se usa solo en rutas que gestionan usuarios ajenos (admin).
export function verificarPermiso(nombrePermiso) {
  return async (req, res, next) => {
    const [rows] = await pool.query(
      `SELECT pe.nombre FROM usuarios u
       JOIN perfil_permisos pp ON u.perfil_id = pp.perfil_id
       JOIN permisos pe ON pp.permiso_id = pe.id
       WHERE u.id = ? AND pe.nombre = ?`,
      [req.usuarioId, nombrePermiso]
    );
    if (rows.length === 0) {
      return res.status(403).json({ error: 'No tenés permiso para realizar esta acción' });
    }
    next();
  };
}