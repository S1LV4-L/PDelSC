export type Curso = { id: number; anio: number; division: number; alumnos: number };

export type Materia = { id: number; nombre: string; anio: number };

// Dictado = materia dada en un curso por un profesor (/dictados/listar)
export type Dictado = {
  id: number;
  materia_id: number;
  materia: string;
  curso_id: number;
  anio: number;
  division: number;
  profesor_id: number;
  profesor: string;
};

// Lo que devuelven /mis-materias y /alumnos/asignaciones
export type DictadoResumen = { id: number; materia: string; anio: number; division: number };

export type AsignacionesAlumno = {
  curso: { id: number; anio: number; division: number } | null;
  dictados: DictadoResumen[];
};

export type EstadoAsistencia = "presente" | "ausente";

// Profesor: lista de alumnos del dictado con el estado de hoy (estado null = todavía no hay QR)
export type AlumnoDictado = {
  alumno_id: number;
  nombre: string;
  asistencia_id: number | null;
  estado: EstadoAsistencia | null;
  nota: string | null;
};

// Profesor: historial de un alumno (id null = el alumno no tiene registro en esa clase)
export type AsistenciaAlumno = {
  id: number | null;
  fecha: string;
  estado: EstadoAsistencia;
  nota: string | null;
};

// Alumno: su propio historial
export type AsistenciaPropia = { fecha: string; estado: EstadoAsistencia; nota: string | null };

export type QrClase = {
  id: number;
  token: string;
  duracion_min: number;
  segundos_restantes: number;
  reemplazado?: boolean;
};

export type EstadisticaDictado = {
  id: number;
  materia: string;
  anio: number;
  division: number;
  clases: number;
  presentes: number;
  ausentes: number;
  porcentaje_presentismo: string | number | null;
};

export type EstadisticaAlumno = {
  id: number;
  nombre: string;
  clases: number;
  presentes: number;
  ausentes: number;
  porcentaje_presentismo: string | number | null;
};