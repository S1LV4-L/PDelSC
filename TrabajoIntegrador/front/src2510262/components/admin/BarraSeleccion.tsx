import { ReactNode, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useAuth } from "../../hooks/useAuth";
import { exportarUsuarios } from "../../services/usuarioService";
import { exportarCsv } from "../../utils/exportar";
import { hoyISO } from "../../utils/formato";
import Button from "../ui/Button";
import Texto from "../ui/Texto";

type Props = {
  ids: number[];
  total: number;
  nombreArchivo: string;
  onTodos: () => void;
  onLimpiar: () => void;
  children?: ReactNode;
};

// Barra de selección: exporta a CSV los usuarios elegidos y admite acciones extra
export default function BarraSeleccion({ ids, total, nombreArchivo, onTodos, onLimpiar, children }: Props) {
  const { token } = useAuth();
  const [exportando, setExportando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [esError, setEsError] = useState(false);
  const exportar = async () => {
    if (!token) return;
    try {
      setExportando(true);
      setMensaje("");
      const tabla = await exportarUsuarios(token, ids);
      await exportarCsv(tabla, `${nombreArchivo}_${hoyISO()}`);
      setEsError(false);
      setMensaje(`${tabla.filas.length} usuario(s) exportado(s)`);
    } catch (e) {
      setEsError(true);
      setMensaje(e instanceof Error ? e.message : "No se pudo exportar");
    } finally {
      setExportando(false);
    }
  };
  
  if (total === 0) return null;
  
  return (
    <View style={styles.barra}>
      <View style={styles.fila}>
        {ids.length > 0 && (
          <>
            <Texto size={14} bold>
              {ids.length} seleccionado(s)
            </Texto>
            <Button style={styles.boton} title="Exportar CSV" onPress={exportar} loading={exportando} />
            {children}
          </>
        )}
        {ids.length < total && <Button variant="link" title="Seleccionar todos" onPress={onTodos} />}
        {ids.length > 0 && <Button variant="link" title="Limpiar" onPress={onLimpiar} />}
      </View>
      {!!mensaje && (
        <Texto size={14} color={esError ? "error" : "success"}>
          {mensaje}
        </Texto>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  barra: { gap: 8 },
  fila: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 8 },
  boton: { paddingVertical: 10, paddingHorizontal: 12 },
});