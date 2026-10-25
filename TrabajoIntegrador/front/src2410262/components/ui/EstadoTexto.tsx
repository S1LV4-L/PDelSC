import { Text } from "react-native";
import { useTheme } from "../../constants/theme";
import { useResponsive } from "../../hooks/useResponsive";
import { EstadoAsistencia } from "../../types/academico";

// estado null = todavía no hay QR del día
export default function EstadoTexto({ estado }: { estado: EstadoAsistencia | null }) {
  const theme = useTheme();
  const { fs } = useResponsive();

  const [texto, color] =
    estado === "presente"
      ? ["Presente", theme.success]
      : estado === "ausente"
        ? ["Ausente", theme.error]
        : ["Sin QR", theme.muted];

  return <Text style={{ color, fontSize: fs(14), fontWeight: "700" }}>{texto}</Text>;
}