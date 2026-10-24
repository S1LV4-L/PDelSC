import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "../../hooks/useAuth";
import {
  actualizarCalificacion,
  crearCalificacion,
  eliminarCalificacion,
  listarCalificaciones,
  planillaNotas,
} from "../../services/calificacionService";
import { Calificacion } from "../../types/academico";
import { fechaLarga, fechaValida, hoyISO } from "../../utils/formato";
import BotonesExportar from "../ui/BotonesExportar";
import Button from "../ui/Button";
import FilaAcciones from "../ui/FilaAcciones";
import FilaItem from "../ui/FilaItem";
import Input from "../ui/Input";
import Tarjeta from "../ui/Tarjeta";
import Texto from "../ui/Texto";

type Form = { id: number | null; alumnoId: number; nombre: string; titulo: string; nota: string; fecha: string };

const promedio = (cs: Calificacion[]) =>
  cs.length ? (cs.reduce((a, c) => a + c.nota, 0) / cs.length).toFixed(2) : "—";

export default function DictadoCalificaciones({ dictadoId }: { dictadoId: number }) {
  const { token } = useAuth();
  const [alumnos, setAlumnos] = useState<{ id: number; nombre: string }[]>([]);
  const [califs, setCalifs] = useState<Calificacion[]>([]);
  const [form, setForm] = useState<Form | null>(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [errorForm, setErrorForm] = useState("");
  
  const cargar = useCallback(async () => {
    if (!token) return;
    try {
      const r = await listarCalificaciones(token, dictadoId);
      setAlumnos(r.alumnos);
      setCalifs(r.calificaciones);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudieron cargar las calificaciones");
    } finally {
      setCargando(false);
    }
  }, [token, dictadoId]);
  
  useEffect(() => {
    cargar();
  }, [cargar]);
  
  const guardar = async () => {
    if (!token || !form) return;
    const nota = Number(form.nota.replace(",", "."));
    if (!form.titulo.trim()) return setErrorForm("Escribe el título");
    if (!(nota >= 1 && nota <= 10)) return setErrorForm("La nota debe estar entre 1 y 10");
    if (!fechaValida(form.fecha)) return setErrorForm("La fecha debe ser YYYY-MM-DD");
    try {
      setGuardando(true);
      setErrorForm("");
      const datos = { titulo: form.titulo.trim(), nota, fecha: form.fecha };
      if (form.id === null) await crearCalificacion(token, { ...datos, dictadoId, alumnoId: form.alumnoId });
      else await actualizarCalificacion(token, { ...datos, id: form.id });
      setForm(null);
      await cargar();
    } catch (e) {
      setErrorForm(e instanceof Error ? e.message : "No se pudo guardar la calificación");
    } finally {
      setGuardando(false);
    }
  };
  
  if (cargando) return <ActivityIndicator />;

  return (
    <>
      <Tarjeta>
        <Texto size={18} bold>Planilla de notas</Texto>
        <BotonesExportar obtener={() => planillaNotas(token!, dictadoId)} nombre={`notas-${hoyISO()}`} />
      </Tarjeta>
      {form && (
        <Tarjeta>
          <Texto size={18} bold>{form.id === null ? "Nueva calificación" : "Editar calificación"} · {form.nombre}</Texto>
          <Input label="Título (ej: Parcial 1)" value={form.titulo} onChangeText={(v) => setForm({ ...form, titulo: v })} autoCapitalize="sentences" maxLength={100} />
          <Input label="Nota (1 a 10)" value={form.nota} onChangeText={(v) => setForm({ ...form, nota: v })} keyboardType="decimal-pad" />
          <Input label="Fecha (YYYY-MM-DD)" value={form.fecha} onChangeText={(v) => setForm({ ...form, fecha: v })} />
          {!!errorForm && <Texto size={14} color="error">{errorForm}</Texto>}
          <Button title="Guardar" onPress={guardar} loading={guardando} />
          <Button variant="link" title="Cancelar" onPress={() => setForm(null)} />
        </Tarjeta>
      )}
      <Tarjeta>
        <Texto size={18} bold>Calificaciones por alumno</Texto>
        {!!error && <Texto size={14} color="error">{error}</Texto>}
        {alumnos.length === 0 ? (
          <Texto color="muted">No hay alumnos inscriptos.</Texto>
        ) : (
          alumnos.map((al) => {
            const propias = califs.filter((c) => c.alumno_id === al.id);
            return (
              <View key={al.id} style={{ gap: 8 }}>
                <FilaItem
                  titulo={al.nombre}
                  subtitulo={`Promedio: ${promedio(propias)}`}
                  derecha={
                    <Button
                      variant="outline"
                      title="+ Agregar"
                      style={{ paddingVertical: 8, paddingHorizontal: 12 }}
                      onPress={() => { setForm({ id: null, alumnoId: al.id, nombre: al.nombre, titulo: "", nota: "", fecha: hoyISO() }); setErrorForm(""); }}
                    />
                  }
                />
                {propias.map((c) => (
                  <FilaAcciones
                    key={c.id}
                    titulo={`${c.titulo}: ${c.nota}`}
                    subtitulo={fechaLarga(c.fecha)}
                    onEditar={() => { setForm({ id: c.id, alumnoId: al.id, nombre: al.nombre, titulo: c.titulo, nota: String(c.nota), fecha: c.fecha }); setErrorForm(""); }}
                    onEliminar={async () => {
                      if (!token) return;
                      try {
                        await eliminarCalificacion(token, c.id);
                        await cargar();
                      } catch (e) {
                        setError(e instanceof Error ? e.message : "No se pudo eliminar");
                      }
                    }}
                  />
                ))}
              </View>
            );
          })
        )}
      </Tarjeta>
    </>
  );
}