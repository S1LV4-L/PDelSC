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
export type AsistenciaPropia = {
  id: number | null;
  fecha: string;
  estado: EstadoAsistencia;
  nota: string | null;
  justificacion: EstadoJustificacion | null;
};
export type QrClase = {
  id: number;
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

export type EstadoJustificacion = "pendiente" | "aprobada" | "rechazada";

export type Tabla = {
  titulo: string;
  subtitulo?: string;
  columnas: string[];
  filas: (string | number | null)[][];
};

export type FilaPresentismo = {
  dictado_id: number;
  materia: string;
  anio: number;
  division: number;
  clases: number;
  presentes: number;
  justificadas: number;
  porcentaje: number | null;
};
export type AlertaAusentismo = FilaPresentismo & { alumno_id: number; nombre: string };

export type QrDinamico = { payload: string | null; segundos_restantes: number; ventana: number };

export type EstadisticasMateria = {
  umbral: number;
  porClase: { fecha: string; total: number; presentes: number; porcentaje: number }[];
  porAlumno: AlertaAusentismo[];
  enRiesgo: AlertaAusentismo[];
};

export type DiaCalendario = { fecha: string; total: number; presentes: number };

export type Justificacion = {
  id: number;
  asistencia_id: number;
  fecha: string;
  materia: string;
  anio: number;
  division: number;
  motivo: string;
  estado: EstadoJustificacion;
  respuesta: string | null;
  tiene_adjunto: boolean;
  alumno?: string; // solo en la vista del administrador
};

export type FilaClaseAdmin = {
  asistencia_id: number;
  alumno_id: number;
  nombre: string;
  estado: EstadoAsistencia;
  justificacion: EstadoJustificacion | null;
  motivo: string | null;
};

export type Comunicado = {
  id: number;
  titulo: string;
  mensaje: string;
  alcance: "global" | "curso" | "usuario";
  fecha: string;
  autor: string | null;
  leido: boolean;
};
export type ComunicadoEnviado = {
  id: number;
  titulo: string;
  mensaje: string;
  alcance: "global" | "curso" | "usuario";
  fecha: string;
  destinos: number;
  lecturas: number;
};

export type Calificacion = { id: number; alumno_id: number; titulo: string; nota: number; fecha: string };

export type EventoAuditoria = {
  id: number;
  fecha: string;
  accion: string;
  usuario: string | null;
  detalle: Record<string, unknown> | null;
};
export type AccesoAuditoria = {
  id: number;
  fecha: string;
  resultado: "exitoso" | "fallido";
  nombre: string | null;
  email: string | null;
};

export type ResultadoImportacion = {
  simulado: boolean;
  total: number;
  validos: number;
  creados: { linea: number; id: number; nombre: string; email: string; password: string; codigos: string[] }[];
  errores: { linea: number; error: string }[];
};
export type ResultadoPromocion = {
  simulado: boolean;
  curso: string;
  destino: string | null;
  crearaDestino: boolean;
  egresan: boolean;
  alumnos: number;
};