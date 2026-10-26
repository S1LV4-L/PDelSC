import { useCallback, useState } from "react";
import { ActivityIndicator } from "react-native";
import { useFocusEffect } from "expo-router";
import Pantalla from "../../components/layout/Pantalla";
import EvaluacionCsv from "../../components/profesor/EvaluacionCsv";
import EvaluacionGrilla from "../../components/profesor/EvaluacionGrilla";
import Chips from "../../components/ui/Chips";
import Tarjeta from "../../components/ui/Tarjeta";
import Texto from "../../components/ui/Texto";
import { useAuth } from "../../hooks/useAuth";
import { misMaterias } from "../../services/academicoService";
import { DictadoResumen } from "../../types/academico";
import { dictadoLabel } from "../../utils/formato";

type Modo = "grilla" | "csv";
const MODOS = [
  { valor: "grilla" as Modo, label: "Carga rápida" },
  { valor: "csv" as Modo, label: "Archivo CSV" },
];

export default function EvaluacionesScreen() {
  const { token } = useAuth();
  const [materias, setMaterias] = useState<DictadoResumen[]>([]);
  const [dictadoId, setDictadoId] = useState<number | null>(null);
  const [modo, setModo] = useState<Modo>("grilla");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  
  useFocusEffect(
    useCallback(() => {
      if (!token) return;
      misMaterias(token)
        .then((lista) => {
          setMaterias(lista);
          setDictadoId((actual) => actual ?? lista[0]?.id ?? null);
          setError("");
        })
        .catch((e) => setError(e instanceof Error ? e.message : "No se pudieron cargar tus materias"))
        .finally(() => setCargando(false));
    }, [token])
  );
  
  return (
    <Pantalla>
      <Texto size={24} bold>Evaluaciones</Texto>
      {!!error && <Texto size={14} color="error">{error}</Texto>}
      {cargando ? (
        <ActivityIndicator />
      ) : materias.length === 0 ? (
        <Tarjeta>
          <Texto color="muted">Todavía no tienes materias asignadas.</Texto>
        </Tarjeta>
      ) : (
        <>
          <Tarjeta>
            <Chips
              opciones={materias.map((m) => ({ valor: m.id, label: dictadoLabel(m) }))}
              valor={dictadoId}
              onChange={setDictadoId}
            />
            <Chips opciones={MODOS} valor={modo} onChange={setModo} />
          </Tarjeta>
          {dictadoId !== null &&
            (modo === "grilla" ? (
              <EvaluacionGrilla key={dictadoId} dictadoId={dictadoId} />
            ) : (
              <EvaluacionCsv key={dictadoId} dictadoId={dictadoId} />
            ))}
        </>
      )}
    </Pantalla>
  );
}