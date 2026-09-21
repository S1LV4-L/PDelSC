import api from "./api";
import { portfolioInicial } from "../types/portfolio";
import type { PortfolioData } from "../types/portfolio";

// Obtiene los datos del Portfolio desde el Backend
export async function obtenerPortfolio(): Promise<PortfolioData> {
  try {
    // POST /api/portfolio para leer (restricción de la tarea)
    const res = await api.post("/portfolio");
    return res.data; // Axios envuelve la respuesta en 'data'
  } catch (error) {
    console.error("Error cargando portfolio, usando datos iniciales:", error);
    // Fallback a datos locales si falla el backend
    return portfolioInicial;
  }
}

// Guarda los datos en el Backend
export async function guardarPortfolio(data: PortfolioData): Promise<void> {
  // POST /api/portfolio/guardar para escribir
  await api.post("/portfolio/guardar", data);
}