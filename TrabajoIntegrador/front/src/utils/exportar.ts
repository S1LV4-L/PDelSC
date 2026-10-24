import { Platform } from "react-native";
import * as FileSystem from "expo-file-system/legacy"; // SDK 53 o menor: "expo-file-system"
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { Tabla } from "../types/academico";

const celda = (v: unknown) => {
  const s = v === null || v === undefined ? "" : String(v);
  return /[";\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
// ";" como separador y BOM: Excel en español abre bien tildes y columnas

export const tablaACsv = (t: Tabla) =>
  "\uFEFF" + [t.columnas, ...t.filas].map((f) => f.map(celda).join(";")).join("\r\n");
const esc = (v: unknown) =>
  String(v ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function tablaAHtml(t: Tabla) {
  const cab = t.columnas.map((c) => `<th>${esc(c)}</th>`).join("");
  const cuerpo = t.filas.map((f) => `<tr>${f.map((c) => `<td>${esc(c)}</td>`).join("")}</tr>`).join("");
  return `<html><head><meta charset="utf-8"/><style>
    body{font-family:Arial,sans-serif;padding:24px}h1{font-size:20px;margin:0}
    p{color:#555;margin:4px 0 16px}table{border-collapse:collapse;width:100%;font-size:11px}
    th,td{border:1px solid #bbb;padding:5px 7px;text-align:left}th{background:#eee}
  </style></head><body><h1>${esc(t.titulo)}</h1>
  <p>${esc(t.subtitulo ?? "")} · Generado el ${new Date().toLocaleDateString("es-AR")}</p>
  <table><thead><tr>${cab}</tr></thead><tbody>${cuerpo}</tbody></table></body></html>`;
}

export async function exportarCsv(t: Tabla, nombreBase: string) {
  const csv = tablaACsv(t);
  const nombre = `${nombreBase}.csv`;
  if (Platform.OS === "web") {
    const doc = (globalThis as any).document;
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = doc.createElement("a");
    a.href = url;
    a.download = nombre;
    a.click();
    URL.revokeObjectURL(url);
    return;
  }
  const uri = `${FileSystem.cacheDirectory}${nombre}`;
  await FileSystem.writeAsStringAsync(uri, csv, { encoding: FileSystem.EncodingType.UTF8 });
  await Sharing.shareAsync(uri, { mimeType: "text/csv", dialogTitle: nombre, UTI: "public.comma-separated-values-text" });
}

export async function exportarPdf(t: Tabla, nombreBase: string) {
  const html = tablaAHtml(t);
  if (Platform.OS === "web") {
    await Print.printAsync({ html }); // abre el diálogo: "Guardar como PDF"
    return;
  }
  const { uri } = await Print.printToFileAsync({ html });
  await Sharing.shareAsync(uri, { mimeType: "application/pdf", dialogTitle: nombreBase, UTI: "com.adobe.pdf" });
}