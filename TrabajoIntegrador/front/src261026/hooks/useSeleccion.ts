import { useCallback, useState } from "react";

// Selección múltiple de ids
export function useSeleccion() {
  const [ids, setIds] = useState<number[]>([]);
  const alternar = useCallback(
    (id: number) => setIds((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id])),
    []
  );
  const seleccionar = useCallback((nuevos: number[]) => setIds(nuevos), []);
  const limpiar = useCallback(() => setIds([]), []);
  return { ids, alternar, seleccionar, limpiar };
}