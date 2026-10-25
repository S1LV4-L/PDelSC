import { useState } from "react";
import { ActivityIndicator, View } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { useAuth } from "../../hooks/useAuth";
import { importarAlumnos } from "../../services/adminService";
import { ResultadoImportacion } from "../../types/academico";
import { exportarCsv } from "../../utils/exportar";
import { hoyISO } from "../../utils/formato";
import Button from "../ui/Button";
import Tarjeta from "../ui/Tarjeta";
import Texto from "../ui/Texto";

export default function AdminImportacion() {
  const { token } = useAuth();
  const [archivo, setArchivo] = useState("");
  const [csv, setCsv] = useState("");
  const [resultado, setResultado] = useState<ResultadoImportacion | null>(null);
  const [trabajando, setTrabajando] = useState<"simular" | "importar" | null>(null);
  const [error, setError] = useState("");
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
      setResultado(await importarAlumnos(token, csv, simular));
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo importar el archivo");
    } finally {
      setTrabajando(null);
    }
  };
  
  const exportarCredenciales = () => {
    if (!resultado) return;
    return exportarCsv(
      {
        titulo: "Credenciales de alumnos importados",
        columnas: ["Nombre", "Email", "Contraseña temporal", "Códigos de recuperación"],
        filas: resultado.creados.map((c) => [c.nombre, c.email, c.password, c.codigos.join(" ")]),
      },
      `credenciales-${hoyISO()}`
    );
  };
  
  return (
    <View style={{ gap: 14 }}>
      <Texto size={20} bold>Carga masiva de alumnos</Texto>
      <Tarjeta>
        <Texto size={14}>Columnas del CSV (separadas por coma o punto y coma):</Texto>
        <Texto size={13} color="muted">nombre, email, anio, division, materias, password</Texto>
        <Texto size={13} color="muted">
          Ejemplo: Ana Pérez,ana@mail.com,1,3,Matemática|Lengua,
        </Texto>
        <Texto size={13} color="muted">
          Si "materias" queda vacío se inscribe en todas las del curso. Si falta la contraseña, se genera una temporal.
        </Texto>
        <Button variant="outline" title={archivo ? `Archivo: ${archivo}` : "Elegir archivo CSV"} onPress={elegir} />
        {!!csv && (
          <>
            <Button variant="outline" title="Validar sin importar" onPress={() => ejecutar(true)} loading={trabajando === "simular"} />
            <Button title="Importar alumnos" onPress={() => ejecutar(false)} loading={trabajando === "importar"} />
          </>
        )}
      </Tarjeta>
      {!!error && <Texto size={14} color="error">{error}</Texto>}
      {trabajando && <ActivityIndicator />}
      {resultado && (
        <Tarjeta>
          <Texto bold size={16}>
            {resultado.simulado
              ? `Validación: ${resultado.validos} de ${resultado.total} filas correctas`
              : `Importación: ${resultado.validos} alumnos creados de ${resultado.total} filas`}
          </Texto>
          {resultado.errores.map((e) => (
            <Texto key={`${e.linea}-${e.error}`} size={14} color="error">Línea {e.linea}: {e.error}</Texto>
          ))}
          {!resultado.simulado && resultado.creados.length > 0 && (
            <>
              <Texto size={14} color="muted">
                Las contraseñas temporales y los códigos solo se muestran ahora. Descárgalos para entregarlos.
              </Texto>
              <Button title="Exportar credenciales (CSV)" onPress={exportarCredenciales} />
            </>
          )}
        </Tarjeta>
      )}
    </View>
  );
}