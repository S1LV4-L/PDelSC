import { apiPost } from "./api";
import { AlumnoDictado, AsistenciaAlumno, AsistenciaPropia, QrClase } from "../types/academico";
import { DiaCalendario, EstadisticasMateria, FilaPresentismo, QrDinamico } from "../types/academico";

// ---------- Profesor ----------
export const qrHoy = (token: string, dictadoId: number) =>
  apiPost<QrClase | null>("/api/asistencias/qr-hoy", { dictadoId }, token);

// Si ya hay QR hoy y reemplazar es false, el backend responde 409
export const generarQr = (token: string, dictadoId: number, duracion: number, reemplazar = false) =>
  apiPost<QrClase>("/api/asistencias/generar-qr", { dictadoId, duracion, reemplazar }, token);

export const alumnosDelDictado = (token: string, dictadoId: number) =>
  apiPost<AlumnoDictado[]>("/api/asistencias/alumnos", { dictadoId }, token);

export const historialAlumno = (token: string, dictadoId: number, alumnoId: number) =>
  apiPost<{ alumno: { id: number; nombre: string }; asistencias: AsistenciaAlumno[] }>(
    "/api/asistencias/historial-alumno",
    { dictadoId, alumnoId },
    token
  );

export const ponerNota = (token: string, id: number, nota: string) =>
  apiPost<{ ok: boolean }>("/api/asistencias/nota", { id, nota }, token);

export const qrDinamico = (token: string, dictadoId: number) =>
  apiPost<QrDinamico>("/api/asistencias/qr-dinamico", { dictadoId }, token);

export const cerrarToma = (token: string, dictadoId: number) =>
  apiPost<{ ok: boolean }>("/api/asistencias/cerrar", { dictadoId }, token);

export const marcarManual = (token: string, dictadoId: number, alumnoId: number) =>
  apiPost<{ ok: boolean }>("/api/asistencias/marcar-manual", { dictadoId, alumnoId }, token);

export const estadisticasMateria = (token: string, dictadoId: number, umbral = 75) =>
  apiPost<EstadisticasMateria>("/api/estadisticas/materia", { dictadoId, umbral }, token);

// ---------- Alumno ----------
export const escanearQr = (token: string, qrToken: string) =>
  apiPost<{ ok: boolean; dictado_id: number }>("/api/asistencias/escanear", { token: qrToken }, token);

export const historialPropio = (token: string, dictadoId: number) =>
  apiPost<AsistenciaPropia[]>("/api/asistencias/historial", { dictadoId }, token);

export const resumenPropio = (token: string) =>
  apiPost<FilaPresentismo[]>("/api/asistencias/resumen", {}, token);

export const calendarioPropio = (token: string, mes: string) =>
  apiPost<DiaCalendario[]>("/api/asistencias/calendario", { mes }, token);