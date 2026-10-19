import { Text } from "react-native";
import CabeceraUsuario from "../../components/CabeceraUsuario";
import HomeAdmin from "../../components/home/HomeAdmin";
import HomeAlumno from "../../components/home/HomeAlumno";
import HomeProfesor from "../../components/home/HomeProfesor";
import Pantalla from "../../components/Pantalla";
import Tarjeta from "../../components/ui/Tarjeta";
import { useTheme } from "../../constants/theme";
import { useAuth } from "../../hooks/useAuth";

export default function HomeScreen() {
  const theme = useTheme();
  const { user } = useAuth();

  switch (user?.perfil.nombre) {
    case "Administrador":
      return <HomeAdmin />;
    case "Profesor":
      return <HomeProfesor />;
    case "Alumno":
      return <HomeAlumno />;
    default:
      return (
        <Pantalla>
          <CabeceraUsuario />
          <Tarjeta>
            <Text style={{ color: theme.muted }}>Tu cuenta todavía no tiene un perfil asignado.</Text>
          </Tarjeta>
        </Pantalla>
      );
  }
}