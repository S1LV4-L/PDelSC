import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { portfolioInicial } from "../types/portfolio";
import type { PortfolioData } from "../types/portfolio";
import { obtenerPortfolio, guardarPortfolio } from "../services/portfolioService";

interface PortfolioContextType {
  data: PortfolioData;
  cargando: boolean;
  guardar: (nuevo: PortfolioData) => Promise<void>;
}

const PortfolioContext = createContext<PortfolioContextType | null>(null);

export function PortfolioProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<PortfolioData>(portfolioInicial);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    obtenerPortfolio()
      .then(setData)
      .catch((error) => {
        console.error(error);
        setData(portfolioInicial);
      })
      .finally(() => setCargando(false));
  }, []);

  const guardar = async (nuevo: PortfolioData) => {
    await guardarPortfolio(nuevo);
    // IMPORTANTE: Recargamos los datos desde el backend después de guardar
    // para obtener los IDs reales generados por la BD (Auto Increment)
    // y sincronizar el estado del frontend.
    const datosActualizados = await obtenerPortfolio();
    setData(datosActualizados);
  };

  return (
    <PortfolioContext.Provider value={{ data, cargando, guardar }}>
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio() {
  const ctx = useContext(PortfolioContext);
  if (!ctx) throw new Error("usePortfolio debe usarse dentro de PortfolioProvider");
  return ctx;
}