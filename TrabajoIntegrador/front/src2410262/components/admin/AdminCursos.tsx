import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../../constants/theme";
import { useAuth } from "../../hooks/useAuth";
import { useResponsive } from "../../hooks/useResponsive";
import {
  actualizarCurso,
  crearCurso,
  eliminarCurso,
  listarCursos,
} from "../../services/academicoService";
import { Curso } from "../../types/academico";
import { cursoLabel } from "../../utils/formato";
import Button from "../ui/Button";
import Chips from "../ui/Chips";
import FilaAcciones from "../ui/FilaAcciones";
import Input from "../ui/Input";

const ANIOS = [1, 2, 3, 4, 5, 6, 7].map((n) => ({ valor: n, label: `${n}°` }));

const validarDivision = (v: string) =>
  /^\d{1,2}$/.test(v.trim()) && Number(v) >= 1 ? null : "Ingresa un número de división (1 a 99)";

export default function AdminCursos() {
  const theme = useTheme();
  const { fs } = useResponsive();
  const { token } = useAuth();

  const [cursos, setCursos] = useState<Curso[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [editando, setEditando] = useState<Curso | "nuevo" | null>(null);
  const [anio, setAnio] = useState<number | null>(null);
  const [division, setDivision] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [errorForm, setErrorForm] = useState("");

  const cargar = useCallback(async () => {
    if (!token) return;
    try {
      setError("");
      setCursos(await listarCursos(token));
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudieron cargar los cursos");
    } finally {
      setCargando(false);
    }
  }, [token]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const abrirForm = (curso?: Curso) => {
    setEditando(curso ?? "nuevo");
    setAnio(curso?.anio ?? null);
    setDivision(curso ? String(curso.division) : "");
    setSubmitted(false);
    setErrorForm("");
  };

  const guardar = async () => {
    setSubmitted(true);
    if (!token || anio === null || validarDivision(division)) return;
    try {
      setGuardando(true);
      setErrorForm("");
      const datos = { anio, division: Number(division) };
      if (editando === "nuevo") await crearCurso(token, datos);
      else if (editando) await actualizarCurso(token, { id: editando.id, ...datos });
      await cargar();
      setEditando(null);
    } catch (e) {
      setErrorForm(e instanceof Error ? e.message : "No se pudo guardar el curso");
    } finally {
      setGuardando(false);
    }
  };

  const eliminar = async (id: number) => {
    if (!token) return;
    try {
      await eliminarCurso(token, id);
      await cargar();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo eliminar el curso");
    }
  };

  if (editando !== null) {
    return (
      <View style={styles.bloque}>
        <Text style={[styles.titulo, { color: theme.text, fontSize: fs(20) }]}>
          {editando === "nuevo" ? "Nuevo curso" : "Editar curso"}
        </Text>

        <View>
          <Text style={[styles.label, { color: theme.text, fontSize: fs(14) }]}>Año</Text>
          <Chips opciones={ANIOS} valor={anio} onChange={setAnio} />
          {submitted && anio === null && (
            <Text style={{ color: theme.error, fontSize: fs(12), marginTop: 4 }}>Elige un año</Text>
          )}
        </View>

        <Input
          label="División"
          value={division}
          onChangeText={setDivision}
          keyboardType="number-pad"
          placeholder="Ej: 3"
          validate={validarDivision}
          submitted={submitted}
        />

        {!!errorForm && <Text style={{ color: theme.error, fontSize: fs(14) }}>{errorForm}</Text>}

        <Button title="Guardar" onPress={guardar} loading={guardando} />
        <Button variant="link" title="Cancelar" onPress={() => setEditando(null)} />
      </View>
    );
  }

  return (
    <View style={styles.bloque}>
      <View style={styles.encabezado}>
        <Text style={[styles.titulo, { color: theme.text, fontSize: fs(20), flex: 1 }]}>Cursos</Text>
        <Button style={styles.boton} title="+" onPress={() => abrirForm()} />
      </View>

      {!!error && <Text style={{ color: theme.error, fontSize: fs(14) }}>{error}</Text>}

      {cargando ? (
        <ActivityIndicator />
      ) : cursos.length === 0 ? (
        <Text style={{ color: theme.muted, fontSize: fs(15) }}>No hay cursos.</Text>
      ) : (
        cursos.map((c) => (
          <FilaAcciones
            key={c.id}
            titulo={`Curso ${cursoLabel(c.anio, c.division)}`}
            subtitulo={`${c.alumnos} alumnos`}
            onEditar={() => abrirForm(c)}
            onEliminar={() => eliminar(c.id)}
          />
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  bloque: { gap: 14 },
  encabezado: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  titulo: { fontWeight: "800", letterSpacing: -0.3 },
  label: { fontWeight: "600", marginBottom: 6 },
  boton: { paddingVertical: 10, paddingHorizontal: 10 },
});