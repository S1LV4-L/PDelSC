import { ComponentProps } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../constants/theme";
import { useAuth } from "../hooks/useAuth";
import { useResponsive } from "../hooks/useResponsive";

type IconName = ComponentProps<typeof Ionicons>["name"];
type Item = { ruta: string; titulo: string; icono: IconName };

const ADMIN: Item[] = [
  { ruta: "/home", titulo: "Inicio", icono: "stats-chart-outline" },
  { ruta: "/usuarios", titulo: "Usuarios", icono: "people-outline" },
  { ruta: "/academico", titulo: "Académico", icono: "school-outline" },
  { ruta: "/asistencia-admin", titulo: "Asistencia", icono: "checkmark-done-outline" },
  { ruta: "/comunicados", titulo: "Avisos", icono: "megaphone-outline" },
  { ruta: "/auditoria", titulo: "Auditoría", icono: "shield-checkmark-outline" },
  { ruta: "/mi-cuenta", titulo: "Mi cuenta", icono: "person-circle-outline" },
];

const DOCENTE_Y_ALUMNO: Item[] = [
  { ruta: "/home", titulo: "Inicio", icono: "home-outline" },
  { ruta: "/notificaciones", titulo: "Notificaciones", icono: "notifications-outline" },
  { ruta: "/mi-cuenta", titulo: "Mi cuenta", icono: "person-circle-outline" },
];

// lateral = true: barra lateral (PC). lateral = false: tabs inferiores (móvil)
export default function Navegacion({ lateral }: { lateral: boolean }) {
  const theme = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { fs } = useResponsive();
  const { user } = useAuth();
  const items = user?.perfil.nombre === "Administrador" ? ADMIN : DOCENTE_Y_ALUMNO;
  
  return (
    <View
      style={[
        lateral ? styles.lateral : styles.inferior,
        { backgroundColor: theme.surface, borderColor: theme.border },
        lateral ? { paddingTop: insets.top + 24 } : { paddingBottom: Math.max(insets.bottom, 8) },
      ]}
    >
      {items.map((item) => {
        const activo = pathname === item.ruta;
        const color = activo ? theme.primary : theme.muted;
        return (
          <Pressable
            key={item.ruta}
            onPress={() => router.replace(item.ruta as never)}
            style={[
              lateral ? styles.itemLateral : styles.itemInferior,
              lateral && activo && { backgroundColor: theme.background },
            ]}
          >
            <Ionicons name={item.icono} size={lateral ? 22 : 22} color={color} />
            <Text
              numberOfLines={1}
              style={{ color, fontSize: lateral ? fs(15) : 10, fontWeight: activo ? "700" : "500" }}
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