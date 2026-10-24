import crypto from "crypto";
import pool from "../db.js";
import { PERMISOS_POR_PERFIL } from "./permisos.js";

export const normalizarEmail = (email) => String(email ?? "").trim().toLowerCase();
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