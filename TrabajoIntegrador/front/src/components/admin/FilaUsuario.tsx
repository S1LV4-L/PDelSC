import { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../../constants/theme";
import { useResponsive } from "../../hooks/useResponsive";
import { UsuarioAdmin } from "../../services/usuarioService";
import { cursoLabel } from "../../utils/formato";

type Props = {
  usuario: UsuarioAdmin;
  esYo?: boolean;
  seleccionado: boolean;
  onAlternar: () => void;
  children?: ReactNode;
};

const fechaCorta = (iso: string) => iso.slice(0, 10).split("-").reverse().join("/");

// Fila de usuario con casilla de selección. Las acciones llegan como children
export default function FilaUsuario({ usuario: u, esYo = false, seleccionado, onAlternar, children }: Props) {
  const theme = useTheme();
  const { fs, isDesktop } = useResponsive();
  const esAlumno = u.perfil.nombre === "Alumno";
  const detalle = [
    u.email ?? "Sin email",
    u.perfil.nombre,
    ...(esAlumno ? [u.curso ? `Curso ${cursoLabel(u.curso.anio, u.curso.division)}` : "Sin curso"] : []),
    ...(u.ocultoEn ? [`Oculto desde ${fechaCorta(u.ocultoEn)}`] : []),
  ].join(" · ");
  
  return (
    <View
      style={[
        styles.fila,
        isDesktop && styles.filaDesktop,
        { borderColor: seleccionado ? theme.primary : theme.border },
      ]}
    >
      <View style={styles.principal}>
        <Pressable
          onPress={onAlternar}
          hitSlop={8}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: seleccionado }}
          style={[
            styles.casilla,
            {
              borderColor: seleccionado ? theme.primary : theme.border,
              backgroundColor: seleccionado ? theme.primary : theme.surface,
            },
          ]}
        >
          {seleccionado && <Text style={styles.tilde}>✓</Text>}
        </Pressable>
        <View style={styles.datos}>
          <Text style={{ color: theme.text, fontSize: fs(16), fontWeight: "700" }}>
            {u.nombre}
            {esYo ? " (tú)" : ""}
          </Text>
          <Text style={{ color: theme.muted, fontSize: fs(14) }}>{detalle}</Text>
        </View>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  fila: { borderWidth: 1, borderRadius: 12, padding: 14, gap: 10 },
  filaDesktop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  principal: { flex: 1, flexDirection: "row", alignItems: "center", gap: 12 },
  datos: { flex: 1, gap: 2 },
  casilla: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  tilde: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },
});