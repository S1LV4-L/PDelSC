import { ResultadoNotas, Tabla } from "../types/academico";
import { apiPost } from "./api";

export type AlumnoEvaluacion = { id: number; nombre: string };

export const alumnosEvaluacion = (token: string, dictadoId: number) =>
  apiPost<{ alumnos: AlumnoEvaluacion[]; hoy: string }>("/api/evaluaciones/alumnos", { dictadoId }, token);

export const cargarEvaluacion = (
  token: string,
  datos: { dictadoId: number; titulo: string; fecha: string; notas: { alumnoId: number; nota: string }[] }
) => apiPost<{ creadas: number }>("/api/evaluaciones/cargar", datos, token);

export const exportarTablaNotas = (token: string, dictadoId: number, tipo: "plantilla" | "notas") =>
  apiPost<Tabla>("/api/evaluaciones/exportar", { dictadoId, tipo }, token);

export const importarNotas = (token: string, dictadoId: number, csv: string, simular: boolean) =>
  apiPost<ResultadoNotas>("/api/evaluaciones/importar", { dictadoId, csv, simular }, token);