import { useState, useEffect } from "react";
import { usePortfolio } from "../context/PortfolioContext";
import type {
  PortfolioData,
  CategoriaSkill,
  Skill,
  Proyecto,
  EnlaceContacto,
} from "../types/portfolio";

const nuevoId = () => crypto.randomUUID();

// Estado del borrador y todas las operaciones de edición del portfolio
export function useDevEditor() {
  const { data, guardar } = usePortfolio();

  const [draft, setDraft] = useState<PortfolioData>(data);
  const [estado, setEstado] = useState<"" | "guardado" | "error">("");

  const hayCambios = JSON.stringify(draft) !== JSON.stringify(data);

  // Sincronizar el borrador si los datos cambian externamente (ej. tras guardar)
  // Esto ayuda a visualizar los IDs nuevos de la BD inmediatamente
  useEffect(() => {
    setDraft(data);
  }, [data]);

  // ----- General / Sobre mi -----
  const setNombre = (nombre: string) => setDraft((d) => ({ ...d, nombre }));

  const setIcono = (icono: string) => setDraft((d) => ({ ...d, icono }));

  const setSobreMi = (campo: keyof PortfolioData["sobreMi"], valor: string) =>
    setDraft((d) => ({ ...d, sobreMi: { ...d.sobreMi, [campo]: valor } }));

  // ----- Skills -----
  const agregarCategoria = () =>
    setDraft((d) => ({
      ...d,
      categorias: [...d.categorias, { id: nuevoId(), titulo: "", icono: "", skills: [] }],
    }));

  const editarCategoria = (id: string, cambios: Partial<Omit<CategoriaSkill, "id" | "skills">>) =>
    setDraft((d) => ({
      ...d,
      categorias: d.categorias.map((c) => (c.id === id ? { ...c, ...cambios } : c)),
    }));

  const quitarCategoria = (id: string) =>
    setDraft((d) => ({ ...d, categorias: d.categorias.filter((c) => c.id !== id) }));

  const agregarSkill = (catId: string) =>
    setDraft((d) => ({
      ...d,
      categorias: d.categorias.map((c) =>
        c.id === catId
          ? { ...c, skills: [...c.skills, { id: nuevoId(), nombre: "", icono: "" }] }
          : c
      ),
    }));

  const editarSkill = (catId: string, skillId: string, cambios: Partial<Omit<Skill, "id">>) =>
    setDraft((d) => ({
      ...d,
      categorias: d.categorias.map((c) =>
        c.id === catId
          ? { ...c, skills: c.skills.map((s) => (s.id === skillId ? { ...s, ...cambios } : s)) }
          : c
      ),
    }));

  const quitarSkill = (catId: string, skillId: string) =>
    setDraft((d) => ({
      ...d,
      categorias: d.categorias.map((c) =>
        c.id === catId ? { ...c, skills: c.skills.filter((s) => s.id !== skillId) } : c
      ),
    }));

  // ----- Proyectos -----
  const agregarProyecto = () =>
    setDraft((d) => ({
      ...d,
      proyectos: [...d.proyectos, { id: nuevoId(), imagen: "", enlace: "" }],
    }));

  const editarProyecto = (id: string, cambios: Partial<Omit<Proyecto, "id">>) =>
    setDraft((d) => ({
      ...d,
      proyectos: d.proyectos.map((p) => (p.id === id ? { ...p, ...cambios } : p)),
    }));

  const quitarProyecto = (id: string) =>
    setDraft((d) => ({ ...d, proyectos: d.proyectos.filter((p) => p.id !== id) }));

  // ----- Contacto -----
  const setEmail = (email: string) =>
    setDraft((d) => ({ ...d, contacto: { ...d.contacto, email } }));

  const agregarEnlace = () =>
    setDraft((d) => ({
      ...d,
      contacto: {
        ...d.contacto,
        enlaces: [...d.contacto.enlaces, { id: nuevoId(), texto: "", url: "" }],
      },
    }));

  const editarEnlace = (id: string, cambios: Partial<Omit<EnlaceContacto, "id">>) =>
    setDraft((d) => ({
      ...d,
      contacto: {
        ...d.contacto,
        enlaces: d.contacto.enlaces.map((e) => (e.id === id ? { ...e, ...cambios } : e)),
      },
    }));

  const quitarEnlace = (id: string) =>
    setDraft((d) => ({
      ...d,
      contacto: { ...d.contacto, enlaces: d.contacto.enlaces.filter((e) => e.id !== id) },
    }));

  // ----- Guardar / descartar -----
  const handleGuardar = async () => {
    try {
      await guardar(draft);
      setEstado("guardado");
      // Limpiar estado de guardado después de 2 segundos
      setTimeout(() => setEstado(""), 2000);
    } catch {
      setEstado("error");
    }
  };

  const handleDescartar = () => {
    setDraft(data);
    setEstado("");
  };

  return {
    draft,
    estado,
    hayCambios,
    setNombre,
    setIcono,
    setSobreMi,
    agregarCategoria,
    editarCategoria,
    quitarCategoria,
    agregarSkill,
    editarSkill,
    quitarSkill,
    agregarProyecto,
    editarProyecto,
    quitarProyecto,
    setEmail,
    agregarEnlace,
    editarEnlace,
    quitarEnlace,
    handleGuardar,
    handleDescartar,
  };
}