import { ScrollView, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import AdminUsuarios from "../../components/AdminUsuarios";
import Bienvenida from "../../components/Bienvenida";
import Button from "../../components/ui/Button";
import { useTheme } from "../../constants/theme";
import { useAuth } from "../../hooks/useAuth";
import { useResponsive } from "../../hooks/useResponsive";

export default function HomeScreen() {
  const router = useRouter();
  const { isDesktop } = useResponsive();
  const theme = useTheme();
  const { user, signOut } = useAuth();

  const puedeVerUsuarios = user?.permisos?.includes("ver_usuarios") ?? false;
  const colores = { backgroundColor: theme.surface, borderColor: theme.border };

  return (
    <ScrollView
      style={{ backgroundColor: theme.background }}
      contentContainerStyle={styles.container}
    >
      <View style={[styles.card, isDesktop && styles.cardDesktop, colores]}>
        <View style={[styles.columna, isDesktop && styles.columnaDesktop]}>
          {user && (
            <Bienvenida nombre={user.nombre} email={user.email} perfil={user.perfil.nombre} />
          )}
        </View>

        <View style={[styles.columna, isDesktop && styles.columnaDesktop]}>
          <Button variant="outline" title="Mi cuenta" onPress={() => router.push("/mi-cuenta")} />
          <Button title="Cerrar sesión" onPress={signOut} />
        </View>
      </View>

      {puedeVerUsuarios && (
        <View style={[styles.cardUsuarios, isDesktop && styles.cardUsuariosDesktop, colores]}>
          <AdminUsuarios />
        </View>
      )}
    </ScrollView>
  );
}

const cardBase = {
  width: "100%" as const,
  maxWidth: 480,
  borderRadius: 20,
  padding: 32,
  borderWidth: 1,
  shadowColor: "#000",
  shadowOpacity: 0.05,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 4 },
  elevation: 3,
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    gap: 24,
  },
  card: { ...cardBase, gap: 12 },
  cardDesktop: {
    width: "85%",
    maxWidth: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 48,
    padding: 40,
  },
  cardUsuarios: { ...cardBase },
  cardUsuariosDesktop: { width: "85%", maxWidth: "100%", padding: 40 },
  columna: { gap: 12 },
  columnaDesktop: { flex: 1 },
});