// scripts/fechas.js: lectura de fechas y "hoy" según la base de datos
import pool from "../db.js";

const ISO = /^(\d{4})-(\d{2})-(\d{2})$/;
const DMY = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;

// Acepta YYYY-MM-DD o DD/MM/YYYY. Devuelve "YYYY-MM-DD" si es una fecha real, o null
export function leerFecha(valor) {
  const t = String(valor ?? "").trim();
  const iso = ISO.exec(t);
  const dmy = DMY.exec(t);
  const [y, m, d] = iso
    ? [iso[1], iso[2], iso[3]].map(Number)
    : dmy ? [dmy[3], dmy[2], dmy[1]].map(Number) : [];
  if (!y) return null;
  const f = new Date(Date.UTC(y, m - 1, d));
  if (f.getUTCFullYear() !== y || f.getUTCMonth() !== m - 1 || f.getUTCDate() !== d) return null;
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

// Fecha de hoy según la base (la misma que usa CURDATE() en el resto del sistema)
export async function hoyDB() {
  const [[r]] = await pool.query("SELECT DATE_FORMAT(CURDATE(), '%Y-%m-%d') AS hoy");
  return r.hoy;
}