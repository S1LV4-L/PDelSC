import { View } from "react-native";
import { Redirect, Stack, useSegments } from "expo-router";
import NavegacionAdmin from "../../components/NavegacionAdmin";
import { useAuth } from "../../hooks/useAuth";
import { useResponsive } from "../../hooks/useResponsive";

// Pantallas restringidas por perfil (el backend igual valida cada request)
const PERFILES_POR_RUTA: Record<string, string[]> = {
  usuarios: ["Administrador"],
  academico: ["Administrador"],
  dictado: ["Profesor"],
  "dictado-alumno": ["Profesor"],
  escanear: ["Alumno"],
  materia: ["Alumno"],
};

export default function AppGroupLayout() {
  const { user } = useAuth();
  const { isDesktop } = useResponsive();
  const segmentos = useSegments() as string[]; // ej: ["(app)", "usuarios"]

  const perfil = user?.perfil.nombre ?? "";
  const esAdmin = perfil === "Administrador";

  const permitidos = PERFILES_POR_RUTA[segmentos[1]];
  if (permitidos && !permitidos.includes(perfil)) return <Redirect href="/home" />;

  return (
    <View style={{ flex: 1, flexDirection: esAdmin && isDesktop ? "row" : "column" }}>
      {esAdmin && isDesktop && <NavegacionAdmin lateral />}

      <View style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false, animation: esAdmin ? "none" : "default" }} />
      </View>

      {esAdmin && !isDesktop && <NavegacionAdmin lateral={false} />}
    </View>
  );
}