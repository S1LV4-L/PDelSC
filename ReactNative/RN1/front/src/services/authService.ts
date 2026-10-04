import { Session, Usuario } from "../types/auth";
import { API_URL, apiPost } from "./api";

export const login = (email: string, password: string) =>
  apiPost<Session>("/api/auth/login", { email, password });

export const register = (nombre: string, email: string, password: string) =>
  apiPost<{ mensaje: string; codigosRecuperacion: string[] }>("/api/auth/registro", {
    nombre,
    email,
    password,
  });

export const resetPassword = (email: string, codigo: string, nuevaPassword: string) =>
  apiPost<{ mensaje: string; codigosRestantes: number }>("/api/auth/restablecer", {
    email,
    codigo,
    nuevaPassword,
  });

export const regenerarCodigos = (token: string, password: string) =>
  apiPost<{ codigosRecuperacion: string[] }>("/api/usuarios/codigos-recuperacion", { password }, token);

export const miPerfil = (token: string) =>
  apiPost<Usuario>("/api/usuarios/mi-perfil", {}, token);

export type Proveedor = "google" | "github" | "jira";

export const urlOAuth = (proveedor: Proveedor) => `${API_URL}/api/auth/${proveedor}`;

export const actualizarCuenta = (
  token: string,
  datos: { nombre?: string; password?: string; passwordActual?: string }
) => apiPost<{ mensaje: string }>("/api/usuarios/mi-cuenta", datos, token);