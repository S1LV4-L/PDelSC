export interface Skill {
  id: string;
  nombre: string;
  icono: string; // URL de la imagen
}

export interface CategoriaSkill {
  id: string;
  titulo: string;
  icono: string;
  skills: Skill[];
}

export interface Proyecto {
  id: string;
  imagen: string;
  enlace: string;
}

export interface EnlaceContacto {
  id: string;
  texto: string;
  url: string;
}

export interface PortfolioData {
  nombre: string;
  icono: string;
  sobreMi: {
    titulo: string;
    subtitulo: string;
    descripcion: string;
  };
  categorias: CategoriaSkill[];
  proyectos: Proyecto[];
  contacto: {
    email: string;
    enlaces: EnlaceContacto[];
  };
}

// Valores por defecto (se usan si todavía no hay nada guardado)
export const portfolioInicial: PortfolioData = {
  nombre: "Lucas Silva",
  icono: "",
  sobreMi: {
    titulo: "Hola! soy Lucas",
    subtitulo: "Programador/desarrollador web",
    descripcion: "descripcion",
  },
  categorias: [
    {
      id: "cat-1",
      titulo: "Frontend",
      icono: "",
      skills: [{ id: "skill-1", nombre: "React", icono: "" }],
    },
  ],
  proyectos: [{ id: "proy-1", imagen: "", enlace: "" }],
  contacto: { email: "", enlaces: [] },
};