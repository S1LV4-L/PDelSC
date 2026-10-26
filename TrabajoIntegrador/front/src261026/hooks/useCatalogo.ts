import { useEffect, useState } from "react";
import { listarCursos, listarMaterias } from "../services/academicoService";
import { Curso, Materia } from "../types/academico";
import { useAuth } from "./useAuth";

// Cursos y materias para armar filtros (solo administrador)
export function useCatalogo() {
  const { token } = useAuth();
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [materias, setMaterias] = useState<Materia[]>([]);
  useEffect(() => {
    if (!token) return;
    Promise.all([listarCursos(token), listarMaterias(token)])
      .then(([c, m]) => {
        setCursos(c);
        setMaterias(m);
      })
      .catch(() => {});
  }, [token]);
  return { cursos, materias };
}