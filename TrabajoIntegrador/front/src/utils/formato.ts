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