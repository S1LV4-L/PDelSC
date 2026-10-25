import { View } from "react-native";
import { Redirect, Stack, useSegments } from "expo-router";
import Navegacion from "../../components/Navegacion";
import { useAuth } from "../../hooks/useAuth";
import { useResponsive } from "../../hooks/useResponsive";

// Pantallas restringidas por perfil (el backend igual valida cada request)
const PERFILES_POR_RUTA: Record<string, string[]> = {
    usuarios: ["Administrador"],
    academico: ["Administrador"],
    "asistencia-admin": ["Administrador"],
    auditoria: ["Administrador"],
    comunicados: ["Administrador"],
    dictado: ["Profesor"],
    "dictado-alumno": ["Profesor"],
    escanear: ["Alumno"],
    materia: ["Alumno"],
    justificar: ["Alumno"],
    justificaciones: ["Alumno"],
    calendario: ["Alumno"],
    notificaciones: ["Profesor", "Alumno"],
};

export default function AppGroupLayout() {
    const { user } = useAuth();
    const { isDesktop } = useResponsive();
    const segmentos = useSegments() as string[]; // ej: ["(app)", "usuarios"]
    const perfil = user?.perfil.nombre ?? "";
    const esAdmin = perfil === "Administrador";
    const conNavegacion = ["Administrador", "Profesor", "Alumno"].includes(perfil);
    const permitidos = PERFILES_POR_RUTA[segmentos[1]];

    if (permitidos && !permitidos.includes(perfil)) return <Redirect href="/home" />;

    return (
        <View style={{ flex: 1, flexDirection: conNavegacion && isDesktop ? "row" : "column" }}>
            {conNavegacion && isDesktop && <Navegacion lateral />}
            <View style={{ flex: 1 }}>
                <Stack screenOptions={{ headerShown: false, animation: esAdmin ? "none" : "default" }} />
            </View>
            {conNavegacion && !isDesktop && <Navegacion lateral={false} />}
        </View>
    );
}
