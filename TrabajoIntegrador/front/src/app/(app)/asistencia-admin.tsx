import { useState } from "react";
import AdminCorrecciones from "../../components/admin/AdminCorrecciones";
import AdminJustificaciones from "../../components/admin/AdminJustificaciones";
import AdminReportes from "../../components/admin/AdminReportes";
import Pantalla from "../../components/layout/Pantalla"
import Chips from "../../components/ui/Chips";
import Tarjeta from "../../components/ui/Tarjeta";

type Seccion = "reportes" | "correcciones" | "justificaciones";

const SECCIONES = [
  { valor: "reportes" as Seccion, label: "Reportes" },
  { valor: "correcciones" as Seccion, label: "Correcciones" },
  { valor: "justificaciones" as Seccion, label: "Justificaciones" },
];

export default function AsistenciaAdminScreen() {
  const [seccion, setSeccion] = useState<Seccion>("reportes");
  return (
    <Pantalla>
      <Tarjeta>
        <Chips opciones={SECCIONES} valor={seccion} onChange={setSeccion} />
      </Tarjeta>
      {seccion === "reportes" && <AdminReportes />}
      {seccion === "correcciones" && <AdminCorrecciones />}
      {seccion === "justificaciones" && <AdminJustificaciones />}
    </Pantalla>
  );
}