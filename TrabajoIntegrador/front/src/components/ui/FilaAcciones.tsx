import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "../../constants/theme";
import { useResponsive } from "../../hooks/useResponsive";
import Button from "./Button";

type Props = {
  titulo: string;
  subtitulo?: string;
  onEditar?: () => void;
  onEliminar?: () => void | Promise<void>;
};

// Fila con botones de editar y eliminar (con confirmación en línea)
export default function FilaAcciones({ titulo, subtitulo, onEditar, onEliminar }: Props) {
  const theme = useTheme();
  const { fs, isDesktop } = useResponsive();
  const [confirmando, setConfirmando] = useState(false);

  const confirmar = async () => {
    setConfirmando(false);
    await onEliminar?.();
  };

  return (
    <View style={[styles.fila, isDesktop && styles.filaDesktop, { borderColor: theme.border }]}>
      <View style={styles.datos}>
        <Text style={{ color: theme.text, fontSize: fs(16), fontWeight: "700" }}>{titulo}</Text>
        {!!subtitulo && <Text style={{ color: theme.muted, fontSize: fs(14) }}>{subtitulo}</Text>}
      </View>

      {confirmando ? (
        <View style={styles.acciones}>
          <Text style={{ color: theme.error, fontSize: fs(14), fontWeight: "600" }}>¿Eliminar?</Text>
          <Button style={styles.boton} title="Confirmar" onPress={confirmar} />
          <Button variant="link" title="Cancelar" onPress={() => setConfirmando(false)} />
        </View>
      ) : (
        <View style={styles.acciones}>
          {onEditar && <Button style={styles.boton} variant="outline" title="✎" onPress={onEditar} />}
          {onEliminar && (
            <Button style={styles.boton} variant="outline" title="✕" onPress={() => setConfirmando(true)} />
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fila: { borderWidth: 1, borderRadius: 12, padding: 14, gap: 10 },
  filaDesktop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  datos: { flex: 1, gap: 2 },
  acciones: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 8 },
  boton: { paddingVertical: 10, paddingHorizontal: 10 },
});