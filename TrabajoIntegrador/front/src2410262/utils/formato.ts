import { ThemeColors } from "../constants/theme";

export const cursoLabel = (anio: number, division: number) => `${anio}°${division}°`;

export const dictadoLabel = (d: { materia: string; anio: number; division: number }) =>
  `${d.materia} · ${cursoLabel(d.anio, d.division)}`;

export const porcentaje = (parte: number, total: number) =>
  total === 0 ? 0 : Math.round((parte / total) * 100);

// fecha: "YYYY-MM-DD" (el backend la manda ya formateada)
export function fechaLarga(fecha: string) {
  const [y, m, d] = fecha.slice(0, 10).split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("es-AR", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatoTiempo(segundos: number) {
  const m = Math.floor(segundos / 60);
  const s = segundos % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export const AMARILLO = "#F59E0B";

// Semáforo de presentismo: verde >= 85, amarillo 75–84, rojo < 75
export const colorPresentismo = (pct: number | null, theme: ThemeColors) =>
  pct === null ? theme.muted : pct >= 85 ? theme.success : pct >= 75 ? AMARILLO : theme.error;

export const etiquetaPresentismo = (pct: number | null) =>
  pct === null ? "Sin clases" : pct >= 85 ? "En regla" : pct >= 75 ? "Atención" : "En riesgo";

const dos = (n: number) => String(n).padStart(2, "0");
export const hoyISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${dos(d.getMonth() + 1)}-${dos(d.getDate())}`;
};

export const mesISO = (d: Date) => `${d.getFullYear()}-${dos(d.getMonth() + 1)}`;

export const fechaValida = (s: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const [a, m, d] = s.split("-").map(Number);
  const f = new Date(a, m - 1, d);
  return f.getFullYear() === a && f.getMonth() === m - 1 && f.getDate() === d;
};