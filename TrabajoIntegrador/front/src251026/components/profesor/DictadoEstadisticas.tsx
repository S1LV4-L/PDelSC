import { useEffect, useState } from "react";
import { ActivityIndicator } from "react-native";
import { useAuth } from "../../hooks/useAuth";
import { estadisticasMateria } from "../../services/asistenciaService";
import { EstadisticasMateria } from "../../types/academico";
import { fechaLarga } from "../../utils/formato";
import Chips from "../ui/Chips";
import FilaItem from "../ui/FilaItem";
import Pct from "../ui/Pct";
import Tarjeta from "../ui/Tarjeta";
import Texto from "../ui/Texto";

const UMBRALES = [60, 70, 75, 80].map((n) => ({ valor: n, label: `< ${n}%` }));

export default function DictadoEstadisticas({ dictadoId }: { dictadoId: number }) {
  const { token } = useAuth();
  const [umbral, setUmbral] = useState(75);
  const [datos, setDatos] = useState<EstadisticasMateria | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  
  useEffect(() => {
    if (!token) return;
    estadisticasMateria(token, dictadoId, umbral)
      .then((d) => {
        setDatos(d);
        setError("");
      })
      .catch((e) => setError(e instanceof Error ? e.message : "No se pudieron cargar las estadísticas"))
      .finally(() => setCargando(false));
  }, [token, dictadoId, umbral]);
  if (cargando) return <ActivityIndicator />;
  if (!datos) return <Texto color="error">{error}</Texto>;
  
  return (
    <>
      <Tarjeta>
        <Texto size={18} bold>Alumnos en riesgo</Texto>
        <Chips opciones={UMBRALES} valor={umbral} onChange={setUmbral} />
        {!!error && <Texto size={14} color="error">{error}</Texto>}
        {datos.enRiesgo.length === 0 ? (
          <Texto color="muted">Ningún alumno está por debajo del {umbral}%.</Texto>
        ) : (
          datos.enRiesgo.map((a) => (
            <FilaItem key={a.alumno_id} titulo={a.nombre} subtitulo={`${a.presentes}/${a.clases} clases`} derecha={<Pct valor={a.porcentaje} />} />
          ))
        )}
      </Tarjeta>
      <Tarjeta>
        <Texto size={18} bold>Por alumno</Texto>
        {datos.porAlumno.map((a) => (
          <FilaItem key={a.alumno_id} titulo={a.nombre} subtitulo={`${a.presentes}/${a.clases} clases`} derecha={<Pct valor={a.porcentaje} />} />
        ))}
      </Tarjeta>
      <Tarjeta>
        <Texto size={18} bold>Por clase</Texto>
        {datos.porClase.length === 0 ? (
          <Texto color="muted">Todavía no hay clases registradas.</Texto>
        ) : (
          datos.porClase.map((c) => (
            <FilaItem key={c.fecha} titulo={fechaLarga(c.fecha)} subtitulo={`${c.presentes} de ${c.total} presentes`} derecha={<Pct valor={c.porcentaje} />} />
          ))
        )}
      </Tarjeta>
    </>
  );
}