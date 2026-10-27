import { getItem, removeItem, setItem } from "../storage/secureStorage";
import type { Session } from "../types/auth";

export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";
export const SESSION_KEY = "session";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

// AuthContext se registra acá para enterarse cuando la sesión se renueva o vence
type Listeners = { onRenovada?: (s: Session) => void; onVencida?: () => void };
const listeners: Listeners = {};
export const registrarListenersSesion = (l: Listeners) => {
  Object.assign(listeners, l);
};

async function enviar(path: string, body: object, token?: string) {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    return { res, data };
  } catch {
    throw new ApiError("No se pudo conectar con el servidor", 0);
  }
}

// Una sola renovación a la vez, aunque fallen varias peticiones juntas
let renovando: Promise<string | null> | null = null;

function renovarSesion(): Promise<string | null> {
  if (!renovando) {
    renovando = (async () => {
      const raw = await getItem(SESSION_KEY);
      if (!raw) return null;
      const sesion: Session = JSON.parse(raw);
      if (!sesion.refreshToken) return null;

      const { res, data } = await enviar("/api/auth/renovar", { refreshToken: sesion.refreshToken });
      if (!res.ok) {
        if (res.status === 401) {
          await removeItem(SESSION_KEY);
          listeners.onVencida?.();
        }
        return null;
      }

      const nueva: Session = { ...sesion, token: data.token, refreshToken: data.refreshToken };
      await setItem(SESSION_KEY, JSON.stringify(nueva));
      listeners.onRenovada?.(nueva);
      return nueva.token;
    })().finally(() => {
      renovando = null;
    });
  }
  return renovando;
}

export async function apiPost<T>(path: string, body: object = {}, token?: string): Promise<T> {
  let { res, data } = await enviar(path, body, token);

  // Token de acceso vencido: se renueva y se reintenta una sola vez
  if (res.status === 401 && token) {
    const nuevoToken = await renovarSesion();
    if (nuevoToken) ({ res, data } = await enviar(path, body, nuevoToken));
  }

  if (!res.ok) throw new ApiError(data.error ?? "Error inesperado", res.status);
  return data as T;
}