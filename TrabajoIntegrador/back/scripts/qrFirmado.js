import crypto from "crypto";

export const VENTANA_QR_SEG = 20; // cada cuánto se renueva el QR en pantalla
const GRACIA_SEG = 5; // tolerancia por demora de la cámara y la red

const secreto = () => process.env.QR_SECRET || process.env.JWT_SECRET;
const firmar = (token, ts) =>
  crypto.createHmac("sha256", secreto()).update(`${token}.${ts}`).digest("hex").slice(0, 24);

// Contenido del QR: token.timestamp.firma (el token de la clase son 48 hex, no tiene puntos)
export function crearPayloadQr(token) {
  const ts = Math.floor(Date.now() / 1000);
  return `${token}.${ts}.${firmar(token, ts)}`;
}

// Devuelve { token } si la firma es válida y es reciente; si no, { error, status }
export function leerPayloadQr(payload) {
  const [token, tsTxt, firma] = String(payload ?? "").split(".");
  const ts = Number(tsTxt);
  if (!token || !firma || !Number.isInteger(ts)) return { error: "QR inválido", status: 400 };

  const esperada = Buffer.from(firmar(token, ts));
  const recibida = Buffer.from(firma);
  if (esperada.length !== recibida.length || !crypto.timingSafeEqual(esperada, recibida)) {
    return { error: "QR inválido", status: 400 };
  }
  const edad = Math.floor(Date.now() / 1000) - ts;
  if (edad > VENTANA_QR_SEG + GRACIA_SEG || edad < -2) {
    return { error: "Ese QR ya venció. Escaneá el que se muestra ahora", status: 410 };
  }
  return { token };
}