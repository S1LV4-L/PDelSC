import { StyleSheet, Text, View } from "react-native";
import { Href, useRouter } from "expo-router";
import { useTheme } from "../constants/theme";
import { useResponsive } from "../hooks/useResponsive";
import Button from "./ui/Button";

const HERRAMIENTAS: { titulo: string; ruta: string }[] = [
  { titulo: "Cámara", ruta: "/camara" },
  { titulo: "Lector de códigos y QR", ruta: "/escaner" },
  { titulo: "Ubicación, GPS y brújula", ruta: "/ubicacion" },
  { titulo: "Acelerómetro, giroscopio y magnetómetro", ruta: "/sensores" },
  { titulo: "Biometría", ruta: "/biometria" },
  { titulo: "Háptica, batería, red, dispositivo y voz", ruta: "/extras" },
];

export default function MenuHerramientas() {
  const theme = useTheme();
  const router = useRouter();
  const { isDesktop, fs } = useResponsive();

  return (
    <View style={styles.contenedor}>
      <Text style={{ color: theme.text, fontSize: fs(20), fontWeight: "800" }}>Herramientas de Expo</Text>
      <View style={styles.grilla}>
        {HERRAMIENTAS.map((h) => (
          <View key={h.ruta} style={[styles.item, { flexBasis: isDesktop ? "30%" : "100%" }]}>
            <Button variant="outline" title={h.titulo} onPress={() => router.push(h.ruta as Href)} />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { gap: 14 },
  grilla: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  item: { flexGrow: 1 },
});