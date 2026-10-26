import { apiPost } from "./api";
import { EstadisticaAlumno, EstadisticaDictado } from "../types/academico";

export const estadisticasDictados = (token: string) =>
  apiPost<EstadisticaDictado[]>("/api/estadisticas/dictados", {}, token);

export const estadisticasAlumnos = (token: string, dictadoId: number) =>
  apiPost<EstadisticaAlumno[]>("/api/estadisticas/dictados/alumnos", { dictadoId }, token);