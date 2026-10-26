import { useState } from "react";
import { View } from "react-native";
import { Tabla } from "../../types/academico";
import { exportarCsv, exportarPdf } from "../../utils/exportar";
import Button from "./Button";
import Texto from "./Texto";

type Props = { obtener: () => Promise<Tabla>; nombre: string };

// Pide la tabla al backend y la exporta como CSV o PDF
export default function BotonesExportar({ obtener, nombre }: Props) {
  const [cargando, setCargando] = useState<"csv" | "pdf" | null>(null);
  const [mensaje, setMensaje] = useState("");
  const [esError, setEsError] = useState(false);
  const exportar = async (formato: "csv" | "pdf") => {
    try {
      setCargando(formato);
      setMensaje("");
      const tabla = await obtener();
      if (tabla.filas.length === 0) {
        setEsError(true);
        setMensaje("No hay datos para exportar");
        return;
      }
      if (formato === "csv") await exportarCsv(tabla, nombre);
      else await exportarPdf(tabla, nombre);
      setEsError(false);
      setMensaje(`${tabla.filas.length} filas exportadas`);
    } catch (e) {
      setEsError(true);
      setMensaje(e instanceof Error ? e.message : "No se pudo exportar");
    } finally {
      setCargando(null);
    }
  };
  
  return (
    <View style={{ gap: 10 }}>
      <Button title="Exportar CSV" onPress={() => exportar("csv")} loading={cargando === "csv"} />
      <Button variant="outline" title="Exportar PDF" onPress={() => exportar("pdf")} loading={cargando === "pdf"} />
      {!!mensaje && <Texto size={14} color={esError ? "error" : "success"}>{mensaje}</Texto>}
    </View>
  );
}