import AdminUsuarios from "../../components/admin/AdminUsuarios";
import Pantalla from "../../components/layout/Pantalla"
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