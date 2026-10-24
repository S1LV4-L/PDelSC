import { useState } from "react";
import { useLocalSearchParams } from "expo-router";
import Pantalla from "../../components/Pantalla";
import DictadoAsistencia from "../../components/profesor/DictadoAsistencia";
import DictadoCalificaciones from "../../components/profesor/DictadoCalificaciones";
import DictadoEstadisticas from "../../components/profesor/DictadoEstadisticas";
import Chips from "../../components/ui/Chips";
import Tarjeta from "../../components/ui/Tarjeta";
import Texto from "../../components/ui/Texto";

type Pestania = "asistencia" | "estadisticas" | "calificaciones";

const PESTANIAS = [
  { valor: "asistencia" as Pestania, label: "Asistencia" },
  { valor: "estadisticas" as Pestania, label: "Estadísticas" },
  { valor: "calificaciones" as Pestania, label: "Calificaciones" },
];

export default function DictadoScreen() {
  const { id, titulo } = useLocalSearchParams<{ id: string; titulo?: string }>();
  const dictadoId = Number(id);
  const [pestania, setPestania] = useState<Pestania>("asistencia");
  
  return (
    <Pantalla volver>
      <Texto size={24} bold>{titulo}</Texto>
      <Tarjeta>
        <Chips opciones={PESTANIAS} valor={pestania} onChange={setPestania} />
      </Tarjeta>
      {pestania === "asistencia" && <DictadoAsistencia dictadoId={dictadoId} titulo={titulo} />}
      {pestania === "estadisticas" && <DictadoEstadisticas dictadoId={dictadoId} />}
      {pestania === "calificaciones" && <DictadoCalificaciones dictadoId={dictadoId} />}
    </Pantalla>
  );
}