import { apiPost } from "./api";
import { Calificacion, ResumenNotas, Tabla } from "../types/academico";

type Ok = { ok: boolean };

export type DatosNota = { titulo: string; nota: number; fecha: string };

// ---------- Profesor ----------
export const listarCalificaciones = (token: string, dictadoId: number) =>
  apiPost<{ alumnos: { id: number; nombre: string }[]; calificaciones: Calificacion[] }>(
    "/api/calificaciones/listar",
    { dictadoId },
    token
  );

  export const crearCalificacion = (token: string, datos: DatosNota & { dictadoId: number; alumnoId: number }) =>
  apiPost<{ id: number }>("/api/calificaciones/crear", datos, token);

export const actualizarCalificacion = (token: string, datos: DatosNota & { id: number }) =>
  apiPost<Ok>("/api/calificaciones/actualizar", datos, token);

export const eliminarCalificacion = (token: string, id: number) =>
  apiPost<Ok>("/api/calificaciones/eliminar", { id }, token);

export const planillaNotas = (token: string, dictadoId: number) =>
  apiPost<Tabla>("/api/calificaciones/planilla", { dictadoId }, token);

// ---------- Alumno ----------
export const misCalificaciones = (token: string, dictadoId: number) =>
  apiPost<Calificacion[]>("/api/calificaciones/mias", { dictadoId }, token);

export const resumenNotas = (token: string) =>
  apiPost<ResumenNotas>("/api/calificaciones/resumen", {}, token);