import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useTheme } from "../../constants/theme";
import { useAuth } from "../../hooks/useAuth";
import { useCatalogo } from "../../hooks/useCatalogo";
import { listarDictados } from "../../services/academicoService";
import {
  clasesDelDictado,
  justificarAdmin,
  listaDeClase,
  marcarPresenteAdmin,
} from "../../services/justificacionService";
import { Dictado, FilaClaseAdmin } from "../../types/academico";
import { cursoLabel, fechaLarga } from "../../utils/formato";
import Button from "../ui/Button";
import Chips from "../ui/Chips";
import ChipsFiltro from "../ui/ChipsFiltro";
import EstadoTexto from "../ui/EstadoTexto";
import Input from "../ui/Input";
import Texto from "../ui/Texto";
import Tarjeta from "../ui/Tarjeta";

type Accion = { id: number; tipo: "presente" | "justificar" } | null;

export default function AdminCorrecciones() {
  const theme = useTheme();
  const { token } = useAuth();
  const { cursos } = useCatalogo();
  const [dictados, setDictados] = useState<Dictado[]>([]);
  const [cursoId, setCursoId] = useState<number | null>(null);
  const [dictadoId, setDictadoId] = useState<number | null>(null);
  const [fechas, setFechas] = useState<string[]>([]);
  const [fecha, setFecha] = useState<string | null>(null);
  const [lista, setLista] = useState<FilaClaseAdmin[]>([]);
  const [cargando, setCargando] = useState(false);
  const [accion, setAccion] = useState<Accion>(null);
  const [motivo, setMotivo] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  
  useEffect(() => {
    if (!token) return;
    listarDictados(token).then(setDictados).catch(() => {});
  }, [token]);
  
  const elegirDictado = async (id: number) => {
    if (!token) return;
    setDictadoId(id);
    setFecha(null);
    setLista([]);
    try {
      setFechas(await clasesDelDictado(token, id));
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudieron cargar las clases");
    }
  };
  
  const cargarLista = useCallback(async () => {
    if (!token || dictadoId === null || !fecha) return;
    try {
      setCargando(true);
      setLista(await listaDeClase(token, dictadoId, fecha));
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo cargar la lista");
    } finally {
      setCargando(false);
    }
  }, [token, dictadoId, fecha]);
  
  useEffect(() => {
    cargarLista();
  }, [cargarLista]);
  
  const confirmar = async () => {
    if (!token || !accion) return;
    if (accion.tipo === "justificar" && motivo.trim().length < 5) {
      setError("Escribe el motivo (mínimo 5 caracteres)");
      return;
    }
    try {
      setGuardando(true);
      setError("");
      if (accion.tipo === "presente") await marcarPresenteAdmin(token, accion.id);
      else await justificarAdmin(token, accion.id, motivo.trim());
      setAccion(null);
      setMotivo("");
      await cargarLista();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo guardar el cambio");
    } finally {
      setGuardando(false);
    }
  };
  
  const dictadosDelCurso = dictados.filter((d) => d.curso_id === cursoId);
  
  return (
    <Tarjeta>
      <Texto size={20} bold>Corregir y justificar asistencias</Texto>
      <Texto size={14} color="muted">Cada cambio queda registrado a tu nombre en la auditoría.</Texto>
      <Texto size={14} bold>Curso</Texto>
      <Chips
        opciones={cursos.map((c) => ({ valor: c.id, label: cursoLabel(c.anio, c.division) }))}
        valor={cursoId}
        onChange={(v) => { setCursoId(v); setDictadoId(null); setFecha(null); setFechas([]); setLista([]); }}
      />
      {cursoId !== null && (
        <>
          <Texto size={14} bold>Materia</Texto>
          {dictadosDelCurso.length === 0 ? (
            <Texto size={14} color="muted">Ese curso no tiene materias asignadas.</Texto>
          ) : (
            <Chips
              opciones={dictadosDelCurso.map((d) => ({ valor: d.id, label: d.materia }))}
              valor={dictadoId}
              onChange={elegirDictado}
            />
          )}
        </>
      )}
      {dictadoId !== null && (
        <>
          <Texto size={14} bold>Clase</Texto>
          {fechas.length === 0 ? (
            <Texto size={14} color="muted">Todavía no hay clases registradas.</Texto>
          ) : (
            <Chips
              opciones={fechas.map((f) => ({ valor: f, label: f.split("-").reverse().slice(0, 2).join("/") }))}
              valor={fecha}
              onChange={setFecha}
            />
          )}
        </>
      )}
      {!!error && <Texto size={14} color="error">{error}</Texto>}
      {fecha && <Texto bold>{fechaLarga(fecha)}</Texto>}
      {cargando ? (
        <ActivityIndicator />
      ) : (
        lista.map((a) => (
          <View key={a.asistencia_id} style={[styles.fila, { borderColor: theme.border }]}>
            <View style={styles.cabecera}>
              <Texto bold style={{ flex: 1 }}>{a.nombre}</Texto>
              <EstadoTexto estado={a.estado} />
            </View>
            {a.estado === "ausente" && !!a.justificacion && (
              <Texto size={14} color={a.justificacion === "aprobada" ? "success" : "muted"}>
                Justificación {a.justificacion}{a.motivo ? `: ${a.motivo}` : ""}
              </Texto>
            )}
            {a.estado === "ausente" && accion?.id !== a.asistencia_id && (
              <View style={styles.acciones}>
                <Button variant="outline" title="Marcar presente" style={styles.chico}
                  onPress={() => { setAccion({ id: a.asistencia_id, tipo: "presente" }); setError(""); }} />
                {a.justificacion !== "aprobada" && (
                  <Button variant="outline" title="Justificar" style={styles.chico}
                    onPress={() => { setAccion({ id: a.asistencia_id, tipo: "justificar" }); setMotivo(""); setError(""); }} />
                )}
              </View>
            )}
            {accion?.id === a.asistencia_id && (
              <View style={{ gap: 8 }}>
                {accion.tipo === "presente" ? (
                  <Texto size={14}>¿Marcar presente a {a.nombre}?</Texto>
                ) : (
                  <Input label="Motivo de la justificación" value={motivo} onChangeText={setMotivo}
                    autoCapitalize="sentences" maxLength={500} />
                )}
                <Button title="Confirmar" onPress={confirmar} loading={guardando} />
                <Button variant="link" title="Cancelar" onPress={() => setAccion(null)} />
              </View>
            )}
          </View>
        ))
      )}
    </Tarjeta>
  );
}

const styles = StyleSheet.create({
  fila: { borderWidth: 1, borderRadius: 12, padding: 14, gap: 8 },
  cabecera: { flexDirection: "row", alignItems: "center", gap: 12 },
  acciones: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  chico: { paddingVertical: 8, paddingHorizontal: 12 },
});