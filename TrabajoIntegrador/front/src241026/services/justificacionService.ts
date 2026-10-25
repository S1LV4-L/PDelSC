import { apiPost } from "./api";
import { EstadoJustificacion, FilaClaseAdmin, Justificacion } from "../types/academico";

type Ok = { ok: boolean };

// ---------- Alumno ----------
export const pedirJustificacion = (
  token: string,
  datos: { asistenciaId: number; motivo: string; adjuntoBase64?: string; adjuntoMime?: string }
) => apiPost<Ok>("/api/justificaciones/pedir", datos, token);

export const justificacionesPropias = (token: string) =>
  apiPost<Justificacion[]>("/api/justificaciones/mias", {}, token);

export const adjuntoJustificacion = (token: string, id: number) =>
  apiPost<{ mime: string; base64: string }>("/api/justificaciones/adjunto", { id }, token);

// ---------- Administrador ----------
export const justificacionesPorEstado = (token: string, estado: EstadoJustificacion) =>
  apiPost<Justificacion[]>("/api/justificaciones/pendientes", { estado }, token);

export const resolverJustificacion = (token: string, id: number, aprobar: boolean, respuesta: string) =>
  apiPost<Ok>("/api/justificaciones/resolver", { id, aprobar, respuesta }, token);

export const clasesDelDictado = (token: string, dictadoId: number) =>
  apiPost<string[]>("/api/admin/asistencias/clases", { dictadoId }, token);

export const listaDeClase = (token: string, dictadoId: number, fecha: string) =>
  apiPost<FilaClaseAdmin[]>("/api/admin/asistencias/lista", { dictadoId, fecha }, token);

export const marcarPresenteAdmin = (token: string, asistenciaId: number) =>
  apiPost<Ok>("/api/admin/asistencias/marcar-presente", { asistenciaId }, token);

export const justificarAdmin = (token: string, asistenciaId: number, motivo: string) =>
  apiPost<Ok>("/api/admin/asistencias/justificar", { asistenciaId, motivo }, token);