import { useState } from "react";
import { ActivityIndicator, View } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { useAuth } from "../../hooks/useAuth";
import { exportarTablaNotas, importarNotas } from "../../services/evaluacionService";
import { ResultadoNotas } from "../../types/academico";
import { exportarCsv } from "../../utils/exportar";
import { hoyISO } from "../../utils/formato";
import Button from "../ui/Button";
import Tarjeta from "../ui/Tarjeta";
import Texto from "../ui/Texto";

type Trabajo = "plantilla" | "notas" | "simular" | "importar";

export default function EvaluacionCsv({ dictadoId }: { dictadoId: number }) {
  const { token } = useAuth();
  const [archivo, setArchivo] = useState("");
  const [csv, setCsv] = useState("");
  const [resultado, setResultado] = useState<ResultadoNotas | null>(null);
  const [trabajando, setTrabajando] = useState<Trabajo | null>(null);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  
  const descargar = async (tipo: "plantilla" | "notas") => {
    if (!token) return;
    try {
      setTrabajando(tipo);
      setError("");
      setMensaje("");
      const tabla = await exportarTablaNotas(token, dictadoId, tipo);
      if (tabla.filas.length === 0) {
        setError(tipo === "notas" ? "Todavía no hay notas para exportar" : "No hay alumnos inscriptos");
        return;
      }
      await exportarCsv(tabla, `${tipo === "notas" ? "notas" : "plantilla-notas"}-${hoyISO()}`);
      setMensaje(`${tabla.filas.length} fila(s) exportadas`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo exportar");
    } finally {
      setTrabajando(null);
    }
  };
  
  const elegir = async () => {
    try {
      setError("");
      const r = await DocumentPicker.getDocumentAsync({
        type: ["text/csv", "text/comma-separated-values", "application/vnd.ms-excel", "text/plain"],
        copyToCacheDirectory: true,
      });
      if (r.canceled) return;
      const asset = r.assets[0];
      setCsv(await (await fetch(asset.uri)).text());
      setArchivo(asset.name);
      setResultado(null);
    } catch {
      setError("No se pudo leer el archivo");
    }
  };
  
  const ejecutar = async (simular: boolean) => {
    if (!token || !csv) return;
    try {
      setTrabajando(simular ? "simular" : "importar");
      setError("");
      const r = await importarNotas(token, dictadoId, csv, simular);
      setResultado(r);
      // Tras importar se descarta el archivo para no cargarlo dos veces
      if (!simular && r.creadas > 0) {
        setCsv("");
        setArchivo("");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo importar el archivo");
    } finally {
      setTrabajando(null);
    }
  };
  
  return (
    <View style={{ gap: 14 }}>
      <Tarjeta>
        <Texto size={18} bold>Descargar</Texto>
        <Button
          variant="outline"
          title="Plantilla con los alumnos del curso"
          onPress={() => descargar("plantilla")}
          loading={trabajando === "plantilla"}
        />
        <Button
          variant="outline"
          title="Notas ya cargadas"
          onPress={() => descargar("notas")}
          loading={trabajando === "notas"}
        />
        {!!mensaje && <Texto size={14} color="success">{mensaje}</Texto>}
      </Tarjeta>
      <Tarjeta>
        <Texto size={18} bold>Importar notas</Texto>
        <Texto size={14}>Columnas (separadas por coma o punto y coma):</Texto>
        <Texto size={13} color="muted">alumno, titulo, nota, fecha</Texto>
        <Texto size={13} color="muted">Ejemplo: Ana Pérez,Parcial 1,8.5,2026-10-20</Texto>
        <Texto size={13} color="muted">
          La nota va de 1 a 10 con un decimal como máximo. La fecha puede ser YYYY-MM-DD o DD/MM/YYYY y no puede
          ser futura. Los alumnos deben existir y cursar esta materia.
        </Texto>
        <Texto size={13} color="muted">
          Las filas con título, nota y fecha vacíos se ignoran. Si alguna fila no cumple el formato, no se importa
          ninguna.
        </Texto>
        <Button variant="outline" title={archivo ? `Archivo: ${archivo}` : "Elegir archivo CSV"} onPress={elegir} />
        {!!csv && (
          <>
            <Button
              variant="outline"
              title="Validar sin importar"
              onPress={() => ejecutar(true)}
              loading={trabajando === "simular"}
            />
            <Button title="Importar notas" onPress={() => ejecutar(false)} loading={trabajando === "importar"} />
          </>
        )}
      </Tarjeta>
      {!!error && <Texto size={14} color="error">{error}</Texto>}
      {(trabajando === "simular" || trabajando === "importar") && <ActivityIndicator />}
      {resultado && (
        <Tarjeta>
          <Texto bold size={16} color={resultado.totalErrores > 0 ? "error" : "success"}>
            {resultado.totalErrores > 0
              ? `Archivo rechazado: ${resultado.totalErrores} fila(s) con errores de ${resultado.total}. No se importó ninguna nota.`
              : resultado.simulado
                ? `Formato correcto: ${resultado.validos} nota(s) listas para importar`
                : `${resultado.creadas} nota(s) importadas`}
          </Texto>
          {resultado.errores.map((e) => (
            <Texto key={`${e.linea}-${e.error}`} size={14} color="error">
              Línea {e.linea}: {e.error}
            </Texto>
          ))}
          {resultado.totalErrores > resultado.errores.length && (
            <Texto size={13} color="muted">
              y {resultado.totalErrores - resultado.errores.length} error(es) más
            </Texto>
          )}
        </Tarjeta>
      )}
    </View>
  );
}