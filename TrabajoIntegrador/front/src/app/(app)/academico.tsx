import { useState } from "react";
import AdminCiclo from "../../components/admin/AdminCiclo";
import AdminCursos from "../../components/admin/AdminCursos";
import AdminDictados from "../../components/admin/AdminDictados";
import AdminImportacion from "../../components/admin/AdminImportacion";
import AdminMaterias from "../../components/admin/AdminMaterias";
import Pantalla from "../../components/layout/Pantalla"
import Chips from "../../components/ui/Chips";
import Tarjeta from "../../components/ui/Tarjeta";
type Seccion = "cursos" | "materias" | "dictados" | "importar" | "ciclo";
const SECCIONES = [
  { valor: "cursos" as Seccion, label: "Cursos" },
  { valor: "materias" as Seccion, label: "Materias" },
  { valor: "dictados" as Seccion, label: "Dictados" },
  { valor: "importar" as Seccion, label: "Importar alumnos" },
  { valor: "ciclo" as Seccion, label: "Cambio de ciclo" },
];
export default function AcademicoScreen() {
  const [seccion, setSeccion] = useState<Seccion>("cursos");
  return (
    <Pantalla>
      <Tarjeta>
        <Chips opciones={SECCIONES} valor={seccion} onChange={setSeccion} />
        {seccion === "cursos" && <AdminCursos />}
        {seccion === "materias" && <AdminMaterias />}
        {seccion === "dictados" && <AdminDictados />}
        {seccion === "importar" && <AdminImportacion />}
        {seccion === "ciclo" && <AdminCiclo />}
      </Tarjeta>
    </Pantalla>
  );
}