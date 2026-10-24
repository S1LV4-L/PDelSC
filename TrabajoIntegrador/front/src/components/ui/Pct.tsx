import { useTheme } from "../../constants/theme";
import { colorPresentismo } from "../../utils/formato";
import Texto from "./Texto";

// Porcentaje con el color del semáforo (verde / amarillo / rojo)
export default function Pct({ valor }: { valor: number | null }) {
  const theme = useTheme();
  return (
    <Texto bold color={colorPresentismo(valor, theme)}>
      {valor === null ? "—" : `${Math.round(valor * 10) / 10}%`}
    </Texto>
  );
}