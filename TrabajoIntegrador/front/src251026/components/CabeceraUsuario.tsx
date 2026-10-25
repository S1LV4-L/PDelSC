import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../hooks/useAuth";
import { useResponsive } from "../hooks/useResponsive";
import Bienvenida from "./Bienvenida";
import Button from "./ui/Button";
import Tarjeta from "./ui/Tarjeta";

// conMiCuenta = false para el administrador (ya tiene "Mi cuenta" en su navegación)
export default function CabeceraUsuario({ conMiCuenta = true }: { conMiCuenta?: boolean }) {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { isDesktop } = useResponsive();

  if (!user) return null;

  return (
    <Tarjeta style={isDesktop ? styles.fila : undefined}>
      <View style={[styles.columna, isDesktop && styles.flex]}>
        <Bienvenida nombre={user.nombre} email={user.email} perfil={user.perfil.nombre} />
      </View>
      <View style={[styles.columna, isDesktop && styles.flex]}>
        {conMiCuenta && (
          <Button variant="outline" title="Mi cuenta" onPress={() => router.push("/mi-cuenta")} />
        )}
        <Button title="Cerrar sesión" onPress={signOut} />
      </View>
    </Tarjeta>
  );
}

const styles = StyleSheet.create({
  fila: { flexDirection: "row", alignItems: "center", gap: 48 },
  columna: { gap: 12 },
  flex: { flex: 1 },
});