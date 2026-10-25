import { apiPost } from "./api";
import { AsignacionesAlumno, Curso, Dictado, DictadoResumen, Materia } from "../types/academico";

type Ok = { ok: boolean };

// ---------- Cursos ----------
export const listarCursos = (token: string) => apiPost<Curso[]>("/api/cursos/listar", {}, token);

export const crearCurso = (token: string, datos: { anio: number; division: number }) =>
  apiPost<{ id: number }>("/api/cursos/crear", datos, token);

export const actualizarCurso = (token: string, datos: { id: number; anio: number; division: number }) =>
  apiPost<Ok>("/api/cursos/actualizar", datos, token);

export const eliminarCurso = (token: string, id: number) =>
  apiPost<Ok>("/api/cursos/eliminar", { id }, token);

// ---------- Materias ----------
export const listarMaterias = (token: string, anio?: number) =>
  apiPost<Materia[]>("/api/materias/listar", { anio }, token);

export const crearMateria = (token: string, datos: { nombre: string; anio: number }) =>
  apiPost<{ id: number }>("/api/materias/crear", datos, token);

export const actualizarMateria = (token: string, datos: { id: number; nombre: string; anio: number }) =>
  apiPost<Ok>("/api/materias/actualizar", datos, token);

export const eliminarMateria = (token: string, id: number) =>
  apiPost<Ok>("/api/materias/eliminar", { id }, token);

// ---------- Dictados ----------
export const listarDictados = (token: string, cursoId?: number) =>
  apiPost<Dictado[]>("/api/dictados/listar", { cursoId }, token);

export const asignarDictado = (
  token: string,
  datos: { materiaId: number; cursoId: number; profesorId: number }
) => apiPost<Ok>("/api/dictados/asignar", datos, token);

export const eliminarDictado = (token: string, id: number) =>
  apiPost<Ok>("/api/dictados/eliminar", { id }, token);

// ---------- Curso y materias de un alumno ----------
export const asignacionesAlumno = (token: string, id: number) =>
  apiPost<AsignacionesAlumno>("/api/alumnos/asignaciones", { id }, token);

export const asignarCursoAlumno = (token: string, id: number, cursoId: number) =>
  apiPost<Ok>("/api/alumnos/asignar-curso", { id, cursoId }, token);

export const asignarDictadosAlumno = (token: string, id: number, dictadoIds: number[]) =>
  apiPost<Ok>("/api/alumnos/asignar-dictados", { id, dictadoIds }, token);

// ---------- Pantalla principal de profesor / alumno ----------
export const misMaterias = (token: string) =>
  apiPost<DictadoResumen[]>("/api/mis-materias", {}, token);