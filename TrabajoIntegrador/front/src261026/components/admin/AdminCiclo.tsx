import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "../../hooks/useAuth";
import { listarCursos } from "../../services/academicoService";
import { promoverCurso } from "../../services/adminService";
import { Curso, ResultadoPromocion } from "../../types/academico";
import { cursoLabel } from "../../utils/formato";
import Button from "../ui/Button";
import FilaItem from "../ui/FilaItem";
import Tarjeta from "../ui/Tarjeta";
import Texto from "../ui/Texto";

export default function AdminCiclo() {
  const { token } = useAuth();
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [cargando, setCargando] = useState(true);
  const [vista, setVista] = useState<{ cursoId: number; datos: ResultadoPromocion } | null>(null);
  const [trabajando, setTrabajando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const cargar = useCallback(async () => {
    if (!token) return;
    try {
      const lista = await listarCursos(token);
      // De 7° a 1°: así el curso de destino ya quedó vacío cuando llegan los alumnos
      setCursos([...lista].sort((a, b) => b.anio - a.anio || a.division - b.division));
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudieron cargar los cursos");
    } finally {
      setCargando(false);
    }
  }, [token]);
  
  useEffect(() => {
    cargar();
  }, [cargar]);
  
  const previsualizar = async (cursoId: number) => {
    if (!token) return;
    try {
      setError("");
      setMensaje("");
      setVista({ cursoId, datos: await promoverCurso(token, cursoId, true) });
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo calcular la promoción");
    }
  };
  
  const confirmar = async () => {
    if (!token || !vista) return;
    try {
      setTrabajando(true);
      const r = await promoverCurso(token, vista.cursoId, false);
      setMensaje(
        r.egresan ? `${r.alumnos} alumnos de ${r.curso} egresaron.` : `${r.alumnos} alumnos pasaron de ${r.curso} a ${r.destino}.`
      );
      setVista(null);
      await cargar();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo promover el curso");
    } finally {
      setTrabajando(false);
    }
  };
  
  if (cargando) return <ActivityIndicator />;
  
  return (
    <View style={{ gap: 14 }}>
      <Texto size={20} bold>Cambio de ciclo lectivo</Texto>
      <Texto size={14} color="muted">
        Promueve un curso completo al año siguiente (misma división). Promueve primero los cursos más altos. Los
        alumnos de 7° egresan y quedan sin curso. Se borran sus inscripciones y se inscriben en todas las
        materias del curso nuevo (puedes ajustarlas después). El historial de asistencias se conserva.
      </Texto>
      {!!mensaje && <Texto bold color="success">{mensaje}</Texto>}
      {!!error && <Texto size={14} color="error">{error}</Texto>}
      {cursos.map((c) => (
        <View key={c.id} style={{ gap: 8 }}>
          <FilaItem
            titulo={cursoLabel(c.anio, c.division)}
            subtitulo={`${c.alumnos} alumnos${c.anio === 7 ? " · egresan" : ` → ${cursoLabel(c.anio + 1, c.division)}`}`}
            derecha={<Texto color="muted" size={20}>›</Texto>}
            onPress={() => previsualizar(c.id)}
          />
          {vista?.cursoId === c.id && (
            <Tarjeta>
              <Texto bold>
                {vista.datos.egresan
                  ? `${vista.datos.alumnos} alumnos de ${vista.datos.curso} egresan.`
                  : `${vista.datos.alumnos} alumnos pasan de ${vista.datos.curso} a ${vista.datos.destino}.`}
              </Texto>
              {vista.datos.crearaDestino && <Texto size={14} color="muted">El curso {vista.datos.destino} no existe: se creará.</Texto>}
              {vista.datos.alumnos === 0 ? (
                <Texto size={14} color="muted">El curso no tiene alumnos.</Texto>
              ) : (
                <Button title="Confirmar promoción" onPress={confirmar} loading={trabajando} />
              )}
              <Button variant="link" title="Cancelar" onPress={() => setVista(null)} />
            </Tarjeta>
          )}
        </View>
      ))}
    </View>
  );
}