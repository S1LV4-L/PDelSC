import { useState, useEffect } from 'react'
import type { Tarea } from '../types/Tarea'

export function useTareas() {
  const [tareas, setTareas] = useState<Tarea[]>(() => {
    const guardadas = localStorage.getItem('tareas')
    return guardadas ? JSON.parse(guardadas) : []
  })

  useEffect(() => {
    localStorage.setItem('tareas', JSON.stringify(tareas))
  }, [tareas])

  const agregarTarea = (nueva: Omit<Tarea, 'id' | 'fechaCreacion'>) => {
    setTareas([...tareas, { ...nueva, id: crypto.randomUUID(), fechaCreacion: new Date().toISOString() }])
  }

  const obtenerTareaPorId = (id: string) => tareas.find((t) => t.id === id)

  const completarTarea = (id: string) => {
    setTareas(tareas.map((t) => 
      t.id === id ? { ...t, completa: true } : t
    ))
  }

  const eliminarTarea = (id: string) => {
    setTareas(tareas.filter((t) => t.id !== id))
  }

  return { tareas, setTareas, agregarTarea, obtenerTareaPorId, completarTarea, eliminarTarea }
}