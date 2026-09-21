import jwt from 'jsonwebtoken';
import pool from '../db.js';

// Solo verifica que el token sea válido y pertenezca a un usuario existente.
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