import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "../constants/theme";
import { useResponsive } from "../hooks/useResponsive";

type Props = {
  nombre: string;
  email: string | null;
  perfil: string;
};

export default function Bienvenida({ nombre, email, perfil }: Props) {
  const theme = useTheme();
  const { fs } = useResponsive();

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { fontSize: fs(30), color: theme.text }]}>Bienvenido, {nombre}</Text>
      {!!email && (
        <Text style={{ fontSize: fs(15), color: theme.muted }}>Email: {email}</Text>
      )}
      <Text style={{ fontSize: fs(15), color: theme.muted }}>Perfil: {perfil}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 6, marginBottom: 12 },
  title: { fontWeight: "800" },
});