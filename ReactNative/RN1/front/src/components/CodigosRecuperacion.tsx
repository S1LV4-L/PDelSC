import { useState } from "react";
import { Platform, Share, StyleSheet, Text, View } from "react-native";
import * as Clipboard from "expo-clipboard";
import { useTheme } from "../constants/theme";
import Button from "./ui/Button";

type Props = { codigos: string[]; onContinue: () => void; continueLabel?: string };

const armarTexto = (codigos: string[]) =>
  ["Códigos de recuperación", "Cada código sirve una sola vez para restablecer tu contraseña.", "", ...codigos].join("\n");

export default function RecoveryCodes({ codigos, onContinue, continueLabel = "Ya los guardé, continuar" }: Props) {
  const theme = useTheme();
  const [copiado, setCopiado] = useState(false);

  const copiar = async () => {
    await Clipboard.setStringAsync(codigos.join("\n"));
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const descargar = async () => {
    const texto = armarTexto(codigos);
    if (Platform.OS === "web") {
      const url = URL.createObjectURL(new Blob([texto], { type: "text/plain" }));
      const enlace = document.createElement("a");
      enlace.href = url;
      enlace.download = "codigos-recuperacion.txt";
      enlace.click();
      URL.revokeObjectURL(url);
    } else {
      await Share.share({ message: texto });
    }
  };

  return (
    <View>
      <Text style={[styles.aviso, { color: theme.muted }]}>
        Guarda estos códigos ahora: no volverás a verlos. Cada uno funciona una sola vez para restablecer tu contraseña.
      </Text>

      <View style={styles.grid}>
        {codigos.map((codigo) => (
          <View key={codigo} style={[styles.codigoContainer, { backgroundColor: theme.background, borderColor: theme.border }]}>
            <Text style={[styles.codigo, { color: theme.text }]} selectable>
              {codigo}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.acciones}>
        <Button variant="outline" title={copiado ? "Copiado ✓" : "Copiar"} onPress={copiar} />
        <Button variant="outline" title="Descargar" onPress={descargar} />
      </View>

      <Button title={continueLabel} onPress={onContinue} />
    </View>
  );
}

const styles = StyleSheet.create({
  aviso: { fontSize: 14, lineHeight: 22, marginBottom: 20 },
  grid: { gap: 10, marginBottom: 20 },
  codigoContainer: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  codigo: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 1.5,
    fontFamily: Platform.select({ ios: "Menlo", default: "monospace" }),
  },
  acciones: { gap: 8, marginBottom: 16 },
});