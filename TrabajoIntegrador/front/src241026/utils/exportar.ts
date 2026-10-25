import { Platform } from "react-native";
import * as FileSystem from "expo-file-system";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { Tabla } from "../types/academico";

const celda = (v: unknown) => {
  const s = v === null || v === undefined ? "" : String(v);
  return /[";\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

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

// Función auxiliar para cargar scripts en Web sin pasar por Metro
const loadScript = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`No se pudo cargar el script: ${src}`));
    document.head.appendChild(script);
  });
};

export async function exportarCsv(t: Tabla, nombreBase: string) {
  const csv = tablaACsv(t);
  const nombre = `${nombreBase}.csv`;
  if (Platform.OS === "web") {
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = nombre;
    a.click();
    URL.revokeObjectURL(url);
    return;
  }
  const uri = `${(FileSystem as any).cacheDirectory}${nombre}`;
  await FileSystem.writeAsStringAsync(uri, csv, { encoding: FileSystem.EncodingType.UTF8 });
  await Sharing.shareAsync(uri, { mimeType: "text/csv", dialogTitle: nombre });
}

export async function exportarPdf(t: Tabla, nombreBase: string) {
  if (Platform.OS === "web") {
    try {
      // Cargamos las librerías desde CDN para evitar el error de Metro (Dynamic Require)
      await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js");
      await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.28/jspdf.plugin.autotable.min.js");

      // Accedemos a través del objeto global window
      const { jsPDF } = (window as any).jspdf;
      const doc = new jsPDF();
      
      doc.setFontSize(18);
      doc.text(t.titulo, 14, 15);
      doc.setFontSize(10);
      const fecha = new Date().toLocaleDateString("es-AR");
      doc.text(`${t.subtitulo ?? ""} · Generado el ${fecha}`, 14, 22);
      
      // @ts-ignore - autoTable es un plugin que se añade al prototipo de jsPDF
      doc.autoTable({
        head: [t.columnas],
        body: t.filas,
        startY: 30,
        styles: { fontSize: 9 },
        headStyles: { fillColor: [230, 230, 230], textColor: [0, 0, 0], fontStyle: 'bold' },
      });
      
      doc.save(`${nombreBase}.pdf`);
    } catch (e) {
      console.error("Error exportando PDF en Web:", e);
      alert("Hubo un error al generar el PDF. Intente nuevamente.");
    }
    return;
  }

  const html = tablaAHtml(t);
  const { uri: tempUri } = await Print.printToFileAsync({ html });
  const nombreArchivo = `${nombreBase}.pdf`;

  if (Platform.OS === "android") {
    try {
      const saf = (FileSystem as any).StorageAccessFramework;
      const permissions = await saf.requestDirectoryPermissionsAsync();
      if (permissions.granted) {
        const uri = await saf.createFileAsync(permissions.directoryUri, nombreArchivo, "application/pdf");
        const pdfBase64 = await FileSystem.readAsStringAsync(tempUri, { encoding: FileSystem.EncodingType.Base64 });
        await FileSystem.writeAsStringAsync(uri, pdfBase64, { encoding: FileSystem.EncodingType.Base64 });
        alert("Archivo guardado correctamente");
      } else {
        await Sharing.shareAsync(tempUri);
      }
    } catch (e) {
      await Sharing.shareAsync(tempUri);
    }
  } else {
    await Sharing.shareAsync(tempUri, { mimeType: "application/pdf", dialogTitle: nombreBase });
  }
}
