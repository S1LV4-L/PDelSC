// scripts/csv.js: lectura de CSV compartida por las importaciones
export const sinTildes = (s) =>
  String(s ?? "").trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

// CSV con comillas, separador "," o ";" (se detecta en la cabecera) y BOM opcional
export function parsearCsv(texto) {
  const limpio = String(texto ?? "").replace(/^\uFEFF/, "");
  const primera = limpio.split(/\r?\n/, 1)[0] ?? "";
  const sep = (primera.match(/;/g)?.length ?? 0) > (primera.match(/,/g)?.length ?? 0) ? ";" : ",";
  const filas = [];
  let fila = [];
  let campo = "";
  let comillas = false;
  const cerrarFila = () => {
    fila.push(campo);
    campo = "";
    if (fila.some((c) => c.trim() !== "")) filas.push(fila);
    fila = [];
  };
  for (let i = 0; i < limpio.length; i++) {
    const ch = limpio[i];
    if (comillas) {
      if (ch === '"' && limpio[i + 1] === '"') { campo += '"'; i++; }
      else if (ch === '"') comillas = false;
      else campo += ch;
    } else if (ch === '"') comillas = true;
    else if (ch === sep) { fila.push(campo); campo = ""; }
    else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && limpio[i + 1] === "\n") i++;
      cerrarFila();
    } else campo += ch;
  }
  cerrarFila();
  return filas;
}