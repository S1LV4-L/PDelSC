import { ReactNode } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../constants/theme";
import { useResponsive } from "../hooks/useResponsive";
import Button from "./ui/Button";

export default function PantallaHerramienta({
  titulo,
  children,
}: {
  titulo: string;
  children: ReactNode;
}) {
  const theme = useTheme();
  const router = useRouter();
  const { isDesktop, fs } = useResponsive();

  const volver = () => (router.canGoBack() ? router.back() : router.replace("/home"));

  return (
    <ScrollView style={{ backgroundColor: theme.background }} contentContainerStyle={styles.scroll}>
      <View
        style={[
          styles.card,
          isDesktop && styles.cardDesktop,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      >
        <View style={styles.encabezado}>
          <Text style={{ color: theme.text, fontSize: fs(24), fontWeight: "800", flex: 1 }}>
            {titulo}
          </Text>
          <Button variant="link" title="Volver" onPress={volver} />
        </View>
        {children}
      </View>
    </ScrollView>
  );
}

export function Seccion({ titulo, children }: { titulo: string; children: ReactNode }) {
  const theme = useTheme();
  const { fs } = useResponsive();
  return (
    <View style={styles.seccion}>
      <Text style={{ color: theme.text, fontSize: fs(18), fontWeight: "700" }}>{titulo}</Text>
      {children}
    </View>
  );
}

export function Dato({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  const theme = useTheme();
  const { fs } = useResponsive();
  return (
    <View style={styles.dato}>
      <Text style={{ color: theme.muted, fontSize: fs(14) }}>{etiqueta}</Text>
      <Text style={{ color: theme.text, fontSize: fs(14), fontWeight: "600", flexShrink: 1 }} selectable>
        {valor}
      </Text>
    </View>
  );
}

export function Aviso({ texto, error = false }: { texto: string; error?: boolean }) {
  const theme = useTheme();
  const { fs } = useResponsive();
  return (
    <Text style={{ color: error ? theme.error : theme.muted, fontSize: fs(14), lineHeight: fs(20) }}>
      {texto}
    </Text>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, alignItems: "center", padding: 24 },
  card: { width: "100%", maxWidth: 520, borderRadius: 20, padding: 24, gap: 16, borderWidth: 1 },
  cardDesktop: { width: "70%", maxWidth: 900, padding: 40 },
  encabezado: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  seccion: { gap: 10 },
  dato: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
});