import { useEffect, useState } from "react";
import { ActivityIndicator } from "react-native";
import { useAuth } from "../../hooks/useAuth";
import { useCatalogo } from "../../hooks/useCatalogo";
import { alertasAusentismo } from "../../services/adminService";
import { AlertaAusentismo } from "../../types/academico";
import { cursoLabel, dictadoLabel } from "../../utils/formato";
import Chips from "../ui/Chips";
import ChipsFiltro from "../ui/ChipsFiltro";
import FilaItem from "../ui/FilaItem";
import Pct from "../ui/Pct";
import Tarjeta from "../ui/Tarjeta";
import Texto from "../ui/Texto";

const UMBRALES = [60, 70, 75, 80, 85].map((n) => ({ valor: n, label: `< ${n}%` }));

export default function AdminAlertas() {
  const { token } = useAuth();
  const { cursos, materias } = useCatalogo();
  const [umbral, setUmbral] = useState(75);
  const [cursoId, setCursoId] = useState<number | null>(null);
  const [materiaId, setMateriaId] = useState<number | null>(null);
  const [filas, setFilas] = useState<AlertaAusentismo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  
  useEffect(() => {
    if (!token) return;
    setCargando(true);
    alertasAusentismo(token, { umbral, cursoId, materiaId })
      .then((l) => {
        setFilas(l);
        setError("");
      })
      .catch((e) => setError(e instanceof Error ? e.message : "No se pudieron cargar las alertas"))
      .finally(() => setCargando(false));
  }, [token, umbral, cursoId, materiaId]);
  
  return (
    <Tarjeta>
      <Texto size={20} bold>Alertas de ausentismo</Texto>
      <Texto size={14} color="muted">Alumnos con presentismo por debajo del umbral, por materia.</Texto>
      <Chips opciones={UMBRALES} valor={umbral} onChange={setUmbral} />
      <Texto size={14} bold>Curso</Texto>
      <ChipsFiltro
        opciones={cursos.map((c) => ({ valor: c.id, label: cursoLabel(c.anio, c.division) }))}
        valor={cursoId}
        onChange={setCursoId}
      />
      <Texto size={14} bold>Materia</Texto>
      <ChipsFiltro
        opciones={materias.map((m) => ({ valor: m.id, label: `${m.nombre} ${m.anio}°` }))}
        valor={materiaId}
        onChange={setMateriaId}
      />
      {!!error && <Texto size={14} color="error">{error}</Texto>}
      {cargando ? (
        <ActivityIndicator />
      ) : filas.length === 0 ? (
        <Texto color="muted">Ningún alumno está por debajo del {umbral}%.</Texto>
      ) : (
        <>
          <Texto size={14} color="muted">{filas.length} casos</Texto>
          {filas.map((f) => (
            <FilaItem
              key={`${f.alumno_id}-${f.dictado_id}`}
              titulo={f.nombre}
              subtitulo={`${dictadoLabel(f)} · ${f.presentes}/${f.clases} clases`}
              derecha={<Pct valor={f.porcentaje} />}
            />
          ))}
        </>
      )}
    </Tarjeta>
  );
}