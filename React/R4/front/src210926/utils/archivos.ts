// Utilidades para convertir archivos subidos en data URLs guardables en la BD.
// Las funciones públicas lanzan Error con un mensaje apto para mostrar al usuario.

const MAX_SVG_BYTES = 100 * 1024;

const MAX_IMAGEN_BYTES = 10 * 1024 * 1024; // archivo original permitido
const MAX_ANCHO_IMAGEN = 800; // px, suficiente para las tarjetas de proyectos
const CALIDAD_JPEG = 0.8;

// Redimensiona y convierte la imagen a JPEG (data URL) para que pese poco
const comprimirImagen = async (archivo: File): Promise<string> => {
  const bitmap = await createImageBitmap(archivo);
  const escala = Math.min(1, MAX_ANCHO_IMAGEN / bitmap.width);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * escala);
  canvas.height = Math.round(bitmap.height * escala);

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas no disponible");

  ctx.fillStyle = "#fff"; // fondo para PNG/WebP con transparencia
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  return canvas.toDataURL("image/jpeg", CALIDAD_JPEG);
};

// Valida un .svg y lo devuelve como data URL
export async function svgADataUrl(archivo: File): Promise<string> {
  if (!archivo.name.toLowerCase().endsWith(".svg")) {
    throw new Error("El archivo debe ser un .svg");
  }
  if (archivo.size > MAX_SVG_BYTES) {
    throw new Error("El SVG no puede superar 100 KB");
  }

  const texto = (await archivo.text()).trim();
  if (!texto.includes("<svg")) {
    throw new Error("El archivo no es un SVG válido");
  }

  return `data:image/svg+xml;utf8,${encodeURIComponent(texto)}`;
}

// Valida una imagen (JPG, PNG o WebP) y la devuelve comprimida como data URL JPEG
export async function imagenADataUrl(archivo: File): Promise<string> {
  if (!archivo.type.startsWith("image/") || archivo.type === "image/svg+xml") {
    throw new Error("El archivo debe ser una imagen (JPG, PNG o WebP)");
  }
  if (archivo.size > MAX_IMAGEN_BYTES) {
    throw new Error("La imagen no puede superar 10 MB");
  }

  try {
    return await comprimirImagen(archivo);
  } catch {
    throw new Error("No se pudo procesar la imagen");
  }
}