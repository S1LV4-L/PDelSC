// Modelo de datos de una tarea
export interface Tarea {
  id: string              // Identificador único (UUID)
  titulo: string
  descripcion: string
  completa: boolean       // Estado de completitud
  fechaCreacion: string   // Fecha en formato ISO
}