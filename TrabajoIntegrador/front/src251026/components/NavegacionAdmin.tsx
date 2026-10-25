import { ComponentProps } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../constants/theme";
import { useResponsive } from "../hooks/useResponsive";

type Ruta = "./home" | "./usuarios" | "./academico" | "./mi-cuenta";
type IconName = ComponentProps<typeof Ionicons>["name"];

const ITEMS: { ruta: Ruta; titulo: string; icono: IconName }[] = [
  { ruta: "./home", titulo: "Inicio", icono: "stats-chart-outline" },
  { ruta: "./usuarios", titulo: "Usuarios", icono: "people-outline" },
  { ruta: "./academico", titulo: "Académico", icono: "school-outline" },
  { ruta: "./mi-cuenta", titulo: "Mi cuenta", icono: "person-circle-outline" },
];

// lateral = true: barra lateral (PC). lateral = false: tabs inferiores (móvil)
export default function NavegacionAdmin({ lateral }: { lateral: boolean }) {
  const theme = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { fs } = useResponsive();

  return (
    <View
      style={[
        lateral ? styles.lateral : styles.inferior,
        { backgroundColor: theme.surface, borderColor: theme.border },
        lateral
          ? { paddingTop: insets.top + 24 }
          : { paddingBottom: Math.max(insets.bottom, 8) },
      ]}
    >
      {ITEMS.map((item) => {
        const activo = pathname === item.ruta;
        const color = activo ? theme.primary : theme.muted;
        return (
          <Pressable
            key={item.ruta}
            onPress={() => router.replace(item.ruta)}
            style={[
              lateral ? styles.itemLateral : styles.itemInferior,
              lateral && activo && { backgroundColor: theme.background },
            ]}
          >
            <Ionicons name={item.icono} size={lateral ? 22 : 24} color={color} />
            <Text
              style={{
                color,
                fontSize: lateral ? fs(15) : 11,
                fontWeight: activo ? "700" : "500",
              }}
            >
              {item.titulo}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  lateral: { width: 230, borderRightWidth: 1, paddingHorizontal: 12, gap: 6 },
  inferior: { flexDirection: "row", borderTopWidth: 1, paddingTop: 8 },
  itemLateral: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  itemInferior: { flex: 1, alignItems: "center", gap: 2 },
});