import { useState, useEffect } from 'react'
import type { Tarea } from '../types/Tarea'

// Hook que centraliza el estado y las operaciones sobre las tareas, persistiendo automáticamente en localStorage.
export function useTareas() {
  // Estado inicial: recupera las tareas guardadas en localStorage (si existen)
  const [tareas, setTareas] = useState<Tarea[]>(() => {
    const guardadas = localStorage.getItem('tareas')
    return guardadas ? JSON.parse(guardadas) : []
  })

  // Sincroniza el estado con localStorage cada vez que cambian las tareas
  useEffect(() => {
    localStorage.setItem('tareas', JSON.stringify(tareas))
  }, [tareas])

  // Agrega una nueva tarea generando su id y fecha de creación
  const agregarTarea = (nueva: Omit<Tarea, 'id' | 'fechaCreacion'>) => {
    setTareas([...tareas, { ...nueva, id: crypto.randomUUID(), fechaCreacion: new Date().toISOString() }])
  }

  const obtenerTareaPorId = (id: string) => tareas.find((t) => t.id === id)

  // Marca una tarea como completa
  const completarTarea = (id: string) => {
    setTareas(tareas.map((t) => 
      t.id === id ? { ...t, completa: true } : t
    ))
  }

  // Elimina una tarea por id
  const eliminarTarea = (id: string) => {
    setTareas(tareas.filter((t) => t.id !== id))
  }

  return { tareas, setTareas, agregarTarea, obtenerTareaPorId, completarTarea, eliminarTarea }
}