import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, TextInput, View } from "react-native";
import { useTheme } from "../../constants/theme";
import { useAuth } from "../../hooks/useAuth";
import { alumnosEvaluacion, AlumnoEvaluacion, cargarEvaluacion } from "../../services/evaluacionService";
import { fechaValida } from "../../utils/formato";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Tarjeta from "../ui/Tarjeta";
import Texto from "../ui/Texto";

const NOTA = /^(10([.,]0)?|[1-9]([.,]\d)?)$/;
const notaValida = (v: string) => v.trim() === "" || NOTA.test(v.trim());
const errorTitulo = (v: string) => (v.trim() ? null : "Escribe el título");

export default function EvaluacionGrilla({ dictadoId }: { dictadoId: number }) {
  const theme = useTheme();
  const { token } = useAuth();
  const [alumnos, setAlumnos] = useState<AlumnoEvaluacion[]>([]);
  const [hoy, setHoy] = useState("");
  const [titulo, setTitulo] = useState("");
  const [fecha, setFecha] = useState("");
  const [notas, setNotas] = useState<Record<number, string>>({});
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  
  useEffect(() => {
    if (!token) return;
    setCargando(true);
    alumnosEvaluacion(token, dictadoId)
      .then((r) => {
        setAlumnos(r.alumnos);
        setHoy(r.hoy);
        setFecha(r.hoy);
        setError("");
      })
      .catch((e) => setError(e instanceof Error ? e.message : "No se pudieron cargar los alumnos"))
      .finally(() => setCargando(false));
  }, [token, dictadoId]);
  
  // La fecha no puede ser posterior a hoy (el servidor lo vuelve a validar)
  const errorFecha = (v: string) =>
    !fechaValida(v) ? "La fecha debe ser YYYY-MM-DD" : v > hoy ? "La fecha no puede ser futura" : null;
  
  const cargadas = alumnos.filter((a) => (notas[a.id] ?? "").trim() !== "");
  
  const guardar = async () => {
    if (!token) return;
    setEnviado(true);
    setMensaje("");
    if (errorTitulo(titulo) || errorFecha(fecha)) return setError("Revisa el título y la fecha");
    if (cargadas.some((a) => !notaValida(notas[a.id]))) {
      return setError("Hay notas inválidas: deben estar entre 1 y 10, con un decimal como máximo");
    }
    if (cargadas.length === 0) return setError("Carga al menos una nota");
    try {
      setGuardando(true);
      setError("");
      const r = await cargarEvaluacion(token, {
        dictadoId,
        titulo: titulo.trim(),
        fecha,
        notas: cargadas.map((a) => ({ alumnoId: a.id, nota: notas[a.id].trim() })),
      });
      setMensaje(`${r.creadas} nota(s) cargadas en "${titulo.trim()}"`);
      setNotas({});
      setTitulo("");
      setEnviado(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudieron guardar las notas");
    } finally {
      setGuardando(false);
    }
  };
  
  if (cargando) return <ActivityIndicator />;
  
  return (
    <>
      <Tarjeta>
        <Texto size={18} bold>Nueva evaluación</Texto>
        <Input
          label="Título (ej: Parcial 1)"
          value={titulo}
          onChangeText={setTitulo}
          autoCapitalize="sentences"
          maxLength={100}
          validate={errorTitulo}
          submitted={enviado}
        />
        <Input
          label="Fecha (YYYY-MM-DD, hoy o anterior)"
          value={fecha}
          onChangeText={setFecha}
          maxLength={10}
          validate={errorFecha}
          submitted={enviado}
        />
      </Tarjeta>
      <Tarjeta>
        <Texto size={18} bold>Notas por alumno</Texto>
        <Texto size={13} color="muted">
          Deja vacío a quien no rindió. {cargadas.length} de {alumnos.length} con nota.
        </Texto>
        {alumnos.length === 0 ? (
          <Texto color="muted">No hay alumnos inscriptos.</Texto>
        ) : (
          alumnos.map((a) => {
            const valor = notas[a.id] ?? "";
            return (
              <View key={a.id} style={[styles.fila, { borderColor: theme.border }]}>
                <Texto bold style={{ flex: 1 }}>{a.nombre}</Texto>
                <TextInput
                  value={valor}
                  onChangeText={(t) => setNotas((p) => ({ ...p, [a.id]: t }))}
                  keyboardType="decimal-pad"
                  maxLength={4}
                  placeholder="—"
                  placeholderTextColor={theme.muted}
                  style={[
                    styles.nota,
                    {
                      color: theme.text,
                      backgroundColor: theme.surface,
                      borderColor: notaValida(valor) ? theme.border : theme.error,
                    },
                  ]}
                />
              </View>
            );
          })
        )}
        {!!error && <Texto size={14} color="error">{error}</Texto>}
        {!!mensaje && <Texto size={14} color="success">{mensaje}</Texto>}
        <Button title="Guardar evaluación" onPress={guardar} loading={guardando} />
      </Tarjeta>
    </>
  );
}

const styles = StyleSheet.create({
  fila: { flexDirection: "row", alignItems: "center", gap: 12, borderWidth: 1, borderRadius: 12, padding: 10 },
  nota: { width: 64, minHeight: 44, borderWidth: 1, borderRadius: 10, textAlign: "center", fontSize: 16 },
});