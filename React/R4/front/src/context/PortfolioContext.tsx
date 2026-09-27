// Contexto global con los datos del portfolio.
// Permite que cualquier componente lea los datos y los guarde sin pasar props.
import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { portfolioInicial } from "../types/portfolio";
import type { PortfolioData } from "../types/portfolio";
import { obtenerPortfolio, guardarPortfolio } from "../services/portfolioService";

interface PortfolioContextType {
  data: PortfolioData;                              // Datos actuales del portfolio
  cargando: boolean;                                // true mientras se hace la carga inicial
  guardar: (nuevo: PortfolioData) => Promise<void>; // Persiste cambios en el back
}

const PortfolioContext = createContext<PortfolioContextType | null>(null);

export function PortfolioProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<PortfolioData>(portfolioInicial);
  const [cargando, setCargando] = useState(true);

  // Se ejecuta una sola vez al montar ([]): carga los datos reales desde el back
  useEffect(() => {
    obtenerPortfolio()
      .then(setData)
      .catch((error) => {
        console.error(error);
        setData(portfolioInicial); // Si falla la petición, se usan los datos por defecto
      })
      .finally(() => setCargando(false)); // Termina la carga, haya salido bien o mal
  }, []);

  // Envía los cambios al back y luego resincroniza el estado local
  const guardar = async (nuevo: PortfolioData) => {
    await guardarPortfolio(nuevo);
    // Recarga los datos desde el back después de guardar para obtener los IDs reales generados por la BD
    // (Auto Increment) y sincronizar el estado del frontend.
    const datosActualizados = await obtenerPortfolio();
    setData(datosActualizados);
  };

  return (
    <PortfolioContext.Provider value={{ data, cargando, guardar }}>
      {children}
    </PortfolioContext.Provider>
  );
}

// Hook para consumir el contexto sin repetir useContext(PortfolioContext)
export function usePortfolio() {
  const ctx = useContext(PortfolioContext);
  // Evita usar el hook fuera del Provider
  if (!ctx) throw new Error("usePortfolio debe usarse dentro de PortfolioProvider");
  return ctx;
}