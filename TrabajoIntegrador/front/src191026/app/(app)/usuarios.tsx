import AdminUsuarios from "../../components/AdminUsuarios";
import Pantalla from "../../components/Pantalla";
import Tarjeta from "../../components/ui/Tarjeta";

export default function UsuariosScreen() {
  return (
    <Pantalla>
      <Tarjeta>
        <AdminUsuarios />
      </Tarjeta>
    </Pantalla>
  );
}