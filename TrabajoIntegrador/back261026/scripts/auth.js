import jwt from 'jsonwebtoken';
import pool from '../db.js';
import { obtenerPermisos } from './helpers.js';

// Verifica que el token sea válido. No exige ningún permiso puntual:
// lo usan tanto rutas de admin como de autoservicio (ej: mi-cuenta).
// Bloquea al instante cualquier sesión de un usuario oculto o inexistente.
export async function verificarToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Token no provisto' });

  const token = authHeader.split(' ')[1];
  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }

  const [rows] = await pool.query('SELECT oculto_en FROM usuarios WHERE id = ?', [payload.id]);
  if (rows.length === 0) return res.status(401).json({ error: 'Token inválido o expirado' });
  if (rows[0].oculto_en) {
    return res.status(403).json({ error: 'Tu cuenta está inactiva. Consultá con la administración' });
  }
  req.usuarioId = payload.id;
  next();
}

// Exige que el perfil del usuario loggeado tenga un permiso puntual.
export function verificarPermiso(nombrePermiso) {
  return async (req, res, next) => {
    const permisos = await obtenerPermisos(req.usuarioId);
    if (!permisos.includes(nombrePermiso)) {
      return res.status(403).json({ error: 'No tenés permiso para realizar esta acción' });
    }
    next();
  };
}

// Lee y valida req.body.dictadoId
function leerDictadoId(req) {
  const id = Number(req.body?.dictadoId);
  return Number.isInteger(id) && id > 0 ? id : null;
}

// El profesor solo opera sobre los dictados que tiene asignados. Deja el id en req.dictadoId
export async function verificarProfesorDelDictado(req, res, next) {
  const dictadoId = leerDictadoId(req);
  if (!dictadoId) return res.status(400).json({ error: 'dictadoId es obligatorio' });

  const [rows] = await pool.query(
    'SELECT 1 FROM dictados WHERE id = ? AND profesor_id = ?',
    [dictadoId, req.usuarioId]
  );
  if (rows.length === 0) return res.status(403).json({ error: 'No dictás esta materia en este curso' });
  req.dictadoId = dictadoId;
  next();
}

// El alumno cursa un dictado si está inscripto en él
export async function alumnoCursaDictado(alumnoId, dictadoId) {
  const [rows] = await pool.query(
    'SELECT 1 FROM inscripciones WHERE alumno_id = ? AND dictado_id = ?',
    [alumnoId, dictadoId]
  );
  return rows.length > 0;
}

// Deja el id en req.dictadoId
export async function verificarAlumnoDelDictado(req, res, next) {
  const dictadoId = leerDictadoId(req);
  if (!dictadoId) return res.status(400).json({ error: 'dictadoId es obligatorio' });

  if (!(await alumnoCursaDictado(req.usuarioId, dictadoId))) {
    return res.status(403).json({ error: 'No cursás esta materia' });
  }
  req.dictadoId = dictadoId;
  next();
}
