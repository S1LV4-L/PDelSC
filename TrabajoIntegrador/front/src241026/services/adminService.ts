import { apiPost } from "./api";
import {
  AccesoAuditoria,
  AlertaAusentismo,
  EventoAuditoria,
  ResultadoImportacion,
  ResultadoPromocion,
  Tabla,
} from "../types/academico";

export type FiltrosReporte = {
  tipo: "detalle" | "resumen";
  cursoId?: number | null;
  materiaId?: number | null;
  alumnoId?: number | null;
  desde?: string;
  hasta?: string;
};

export const alertasAusentismo = (
  token: string,
  datos: { umbral: number; cursoId?: number | null; materiaId?: number | null }
) => apiPost<AlertaAusentismo[]>("/api/ausentismo/alertas", datos, token);

export const reporteAsistencia = (token: string, filtros: FiltrosReporte) =>
  apiPost<Tabla>("/api/reportes/asistencia", filtros, token);

export const importarAlumnos = (token: string, csv: string, simular: boolean) =>
  apiPost<ResultadoImportacion>("/api/importacion/alumnos", { csv, simular }, token);

export const promoverCurso = (token: string, cursoId: number, simular: boolean) =>
  apiPost<ResultadoPromocion>("/api/ciclo/promover", { cursoId, simular }, token);

export const auditoriaAccesos = (token: string, resultado?: "exitoso" | "fallido") =>
  apiPost<AccesoAuditoria[]>("/api/auditoria/accesos", { resultado }, token);

export const auditoriaEventos = (token: string, accion?: string) =>
  apiPost<EventoAuditoria[]>("/api/auditoria/eventos", { accion }, token);