// Catálogo de recetas
import type { NavegacionProps } from "../types";
import '../styles/Recetas.css';
import { ThemeToggle } from "../components/BotonTema";
import { BotonScrollTop } from "../components/BotonScrollTop";

interface Receta {
  nombre: string;
  tiempo: string;
  dificultad: "Fácil" | "Media" | "Difícil";
  descripcion: string;
  pasos: string[];
}

const recetas: Receta[] = [
  {
    nombre: "Milanesas a la napolitana",
    tiempo: "40 min",
    dificultad: "Fácil",
    descripcion: "Milanesas de carne cubiertas con salsa de tomate, jamón y queso, gratinadas al horno.",
    pasos: [
      "Freír las milanesas hasta dorarlas de ambos lados.",
      "Colocarlas en una fuente para horno.",
      "Cubrir cada una con salsa de tomate, una feta de jamón y queso.",
      "Llevar al horno hasta que el queso se derrita.",
      "Servir caliente, acompañadas de puré o papas fritas.",
    ],
  },
  {
    nombre: "Ensalada César",
    tiempo: "15 min",
    dificultad: "Fácil",
    descripcion: "Lechuga, pollo grillado, crutones y aderezo César con un toque de parmesano.",
    pasos: [
      "Cocinar el pollo a la plancha y cortarlo en tiras.",
      "Lavar y cortar la lechuga.",
      "Tostar el pan en cubos para los crutones.",
      "Mezclar todos los ingredientes en un bowl.",
      "Agregar el aderezo y el parmesano rallado antes de servir.",
    ],
  },
  {
    nombre: "Risotto de hongos",
    tiempo: "45 min",
    dificultad: "Media",
    descripcion: "Arroz cremoso cocido a fuego lento con hongos salteados, manteca y queso parmesano.",
    pasos: [
      "Saltear los hongos en manteca y reservar.",
      "Rehogar cebolla picada y agregar el arroz hasta nacarar.",
      "Incorporar caldo caliente de a poco, revolviendo constantemente.",
      "Sumar los hongos cuando el arroz esté casi listo.",
      "Retirar del fuego y mantecar con parmesano.",
    ],
  },
  {
    nombre: "Tacos al pastor",
    tiempo: "35 min",
    dificultad: "Media",
    descripcion: "Tortillas rellenas de cerdo marinado, piña, cilantro y cebolla.",
    pasos: [
      "Marinar el cerdo con especias y jugo de naranja.",
      "Cocinar la carne a fuego fuerte hasta dorar.",
      "Calentar las tortillas.",
      "Armar los tacos con la carne, piña picada, cilantro y cebolla.",
      "Servir con limón y salsa picante a gusto.",
    ],
  },
  {
    nombre: "Empanadas de carne",
    tiempo: "60 min",
    dificultad: "Media",
    descripcion: "Empanadas caseras rellenas de carne cortada a cuchillo, cebolla y especias.",
    pasos: [
      "Rehogar la cebolla hasta que esté transparente.",
      "Agregar la carne picada a cuchillo y cocinar hasta que tome color.",
      "Condimentar con comino, pimentón y ají molido, dejar enfriar.",
      "Rellenar los discos de masa y cerrar con repulgue.",
      "Hornear o freír hasta que estén doradas.",
    ],
  },
  {
    nombre: "Sopa de calabaza",
    tiempo: "30 min",
    dificultad: "Fácil",
    descripcion: "Sopa cremosa de calabaza asada con jengibre y un toque de crema.",
    pasos: [
      "Cortar la calabaza en cubos y hornear hasta que esté tierna.",
      "Rehogar cebolla y jengibre en una olla.",
      "Agregar la calabaza asada y caldo, cocinar unos minutos.",
      "Procesar todo hasta obtener una crema homogénea.",
      "Servir con un chorrito de crema por encima.",
    ],
  },
  {
    nombre: "Pollo al curry",
    tiempo: "40 min",
    dificultad: "Media",
    descripcion: "Trozos de pollo cocidos en salsa de curry, leche de coco y vegetales.",
    pasos: [
      "Sellar los trozos de pollo en una olla con aceite.",
      "Agregar cebolla, ajo y curry en polvo, cocinar un par de minutos.",
      "Incorporar leche de coco y los vegetales elegidos.",
      "Cocinar a fuego medio hasta que el pollo esté bien cocido.",
      "Servir con arroz blanco.",
    ],
  },
  {
    nombre: "Brownie de chocolate",
    tiempo: "45 min",
    dificultad: "Fácil",
    descripcion: "Bizcochuelo húmedo de chocolate con nueces, ideal para el postre.",
    pasos: [
      "Derretir el chocolate junto con la manteca.",
      "Batir los huevos con el azúcar hasta espumar.",
      "Unir el chocolate derretido con la mezcla de huevos.",
      "Incorporar la harina tamizada y las nueces picadas.",
      "Hornear en molde enmantecado hasta que esté cocido pero húmedo en el centro.",
    ],
  },
  {
    nombre: "Ñoquis de papa",
    tiempo: "55 min",
    dificultad: "Media",
    descripcion: "Ñoquis caseros de papa servidos con salsa a elección, tradición del día 29.",
    pasos: [
      "Hervir las papas con cáscara hasta que estén tiernas.",
      "Pisarlas aún calientes hasta lograr un puré liso.",
      "Agregar harina y huevo hasta formar una masa tierna.",
      "Formar rollos, cortar los ñoquis y marcarlos con un tenedor.",
      "Cocinar en agua hirviendo hasta que floten y servir con la salsa elegida.",
    ],
  },
];

// Recibe setPagina a través de las props
export default function Recetas({ setPagina }: NavegacionProps) {
  return (
    <div>
      <ThemeToggle/>
      <h1>Recetas</h1>
      <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
        <button className="btn-link" onClick={() => setPagina("home")}>
          Volver al Home
        </button>
      </div>
      <div className="recetas-tablero">
        {recetas.map((receta) => (
          <div key={receta.nombre} className="recetas-celda">
            <h2 className="receta-nombre">{receta.nombre}</h2>
            <div className="receta-meta">
              <span>⏱ {receta.tiempo}</span>
              <span>· {receta.dificultad}</span>
            </div>
            <p className="receta-descripcion">{receta.descripcion}</p>
            <p className="receta-pasos-titulo">Pasos:</p>
            <ol className="receta-pasos">
              {receta.pasos.map((paso, indice) => (
                <li key={indice}>{paso}</li>
              ))}
            </ol>
          </div>
        ))}
      </div>
      <BotonScrollTop/>
    </div>
  );
}