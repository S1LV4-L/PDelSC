// Hook que encapsula toda la lógica de "traer y borrar usuarios" para que las páginas que lo usan no repitan este código.
import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import type { Usuario } from '../types/index';

export function useUsuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // useCallback evita que esta función se recree en cada render,
  // lo cual es necesario para que el useEffect de abajo no se ejecute de más.
  const cargarUsuarios = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.post<Usuario[]>('/usuarios/listar');
      setUsuarios(data);
      setError(null);
    } catch {
      setError('No se pudieron cargar los usuarios');
    } finally {
      setLoading(false);
    }
  }, []);

  // Se ejecuta una sola vez, cuando el componente que use este hook se monta
  useEffect(() => {
    cargarUsuarios();
  }, [cargarUsuarios]);

  // Borra un usuario en el back y lo saca del estado local sin necesidad de volver a pedir toda la lista de nuevo
  const eliminarUsuario = async (id: number) => {
    await api.post('/usuarios/eliminar', { id });
    setUsuarios((prev) => prev.filter((u) => u.id !== id));
  };

  return { usuarios, loading, error, cargarUsuarios, eliminarUsuario };
}