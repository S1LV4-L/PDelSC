import crypto from "crypto";
import pool from "../db.js";
import { PERMISOS_POR_PERFIL } from "./permisos.js";

export const normalizarEmail = (email) => String(email ?? "").trim().toLowerCase();
export const entero = (v, min, max) => Number.isInteger(Number(v)) && Number(v) >= min && Number(v) <= max;
export const emailValido = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);


// ---------- Códigos de recuperación ----------

const ALFABETO = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const CANTIDAD_CODIGOS = 3;

const normalizarCodigo = (codigo) => String(codigo ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "");

export const hashCodigo = (codigo) =>
    crypto.createHmac("sha256", process.env.JWT_SECRET).update(normalizarCodigo(codigo)).digest("hex");

function generarCodigo() {
    let c = "";
    for (let i = 0; i < 10; i++) c += ALFABETO[crypto.randomInt(ALFABETO.length)];
    return `${c.slice(0, 5)}-${c.slice(5)}`;
}

// Reemplaza todos los códigos anteriores del usuario y devuelve los nuevos en texto plano (se muestran una sola vez)
export async function crearCodigosRecuperacion(usuarioId) {
    await pool.query("DELETE FROM codigos_recuperacion WHERE usuario_id = ?", [usuarioId]);
    const codigos = Array.from({ length: CANTIDAD_CODIGOS }, generarCodigo);
    await pool.query(
        "INSERT INTO codigos_recuperacion (usuario_id, codigo_hash) VALUES ?",
        [codigos.map((c) => [usuarioId, hashCodigo(c)])]
    );
    return codigos;
}

// Nombres de los permisos del perfil del usuario (ej: ["ver_usuarios", "crear_usuario"])
// Los permisos de cada perfil están definidos en scripts/permisos.js
export async function obtenerPermisos(usuarioId) {
    const [rows] = await pool.query(
        `SELECT p.nombre FROM usuarios u JOIN perfiles p ON p.id = u.perfil_id WHERE u.id = ?`,
        [usuarioId]
    );
    return PERMISOS_POR_PERFIL[rows[0]?.nombre] ?? [];
}

// ---------- Validación de texto libre (comunicados, títulos de calificaciones) ----------
const LETRAS = "A-Za-zÁÉÍÓÚÜÑáéíóúüñ";
const PUNTUACION = ".,;:¿?¡!()\\-\"'";

// Devuelve el mensaje de error o null si el texto es válido. Solo admite letras, signos de puntuación
// y espacios simples (con multilinea también saltos de línea).
export function validarTextoLibre(valor, { etiqueta, minLetras, max, multilinea = false }) {
  const texto = String(valor ?? "").trim();
  if (!texto) return `${etiqueta} es obligatorio`;
  if (texto.length > max) return `${etiqueta} no puede tener más de ${max} caracteres`;
  const permitidos = `${LETRAS}${PUNTUACION} ${multilinea ? "\\r\\n" : ""}`;
  if (!new RegExp(`^[${permitidos}]+$`).test(texto)) {
    return `${etiqueta} solo puede contener letras y signos de puntuación`;
  }
  if (/ {2,}/.test(texto)) return `${etiqueta} no puede contener dos o más espacios juntos`;
  const letras = texto.match(new RegExp(`[${LETRAS}]`, "g"))?.length ?? 0;
  if (letras < minLetras) return `${etiqueta} debe tener al menos ${minLetras} letras`;
  return null;
}