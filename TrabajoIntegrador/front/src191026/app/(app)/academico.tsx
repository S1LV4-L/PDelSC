import { useState } from "react";
import AdminCursos from "../../components/admin/AdminCursos";
import AdminDictados from "../../components/admin/AdminDictados";
import AdminMaterias from "../../components/admin/AdminMaterias";
import Pantalla from "../../components/Pantalla";
import Chips from "../../components/ui/Chips";
import Tarjeta from "../../components/ui/Tarjeta";

type Seccion = "cursos" | "materias" | "dictados";

const SECCIONES = [
  { valor: "cursos" as Seccion, label: "Cursos" },
  { valor: "materias" as Seccion, label: "Materias" },
  { valor: "dictados" as Seccion, label: "Dictados" },
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
      </Tarjeta>
    </Pantalla>
  );
}