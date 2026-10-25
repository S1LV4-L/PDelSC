import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../../constants/theme";
import { useAuth } from "../../hooks/useAuth";
import { useResponsive } from "../../hooks/useResponsive";
import {
  asignarDictado,
  eliminarDictado,
  listarCursos,
  listarDictados,
  listarMaterias,
} from "../../services/academicoService";
import { listarUsuarios, UsuarioAdmin } from "../../services/usuarioService";
import { Curso, Dictado, Materia } from "../../types/academico";
import { cursoLabel, dictadoLabel } from "../../utils/formato";
import Button from "../ui/Button";
import Chips from "../ui/Chips";
import FilaAcciones from "../ui/FilaAcciones";

export default function AdminDictados() {
  const theme = useTheme();
  const { fs } = useResponsive();
  const { token } = useAuth();

  const [dictados, setDictados] = useState<Dictado[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [profesores, setProfesores] = useState<UsuarioAdmin[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [editando, setEditando] = useState<Dictado | "nuevo" | null>(null);
  const [cursoId, setCursoId] = useState<number | null>(null);
  const [materiaId, setMateriaId] = useState<number | null>(null);
  const [profesorId, setProfesorId] = useState<number | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [errorForm, setErrorForm] = useState("");

  const cargar = useCallback(async () => {
    if (!token) return;
    try {
      setError("");
      const [d, c, m, u] = await Promise.all([
        listarDictados(token),
        listarCursos(token),
        listarMaterias(token),
        listarUsuarios(token),
      ]);
      setDictados(d);
      setCursos(c);
      setMaterias(m);
      setProfesores(u.filter((x) => x.perfil.nombre === "Profesor"));
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudieron cargar los dictados");
    } finally {
      setCargando(false);
    }
  }, [token]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const abrirForm = (dictado?: Dictado) => {
    setEditando(dictado ?? "nuevo");
    setCursoId(dictado?.curso_id ?? null);
    setMateriaId(dictado?.materia_id ?? null);
    setProfesorId(dictado?.profesor_id ?? null);
    setErrorForm("");
  };

  const guardar = async () => {
    if (!token) return;
    if (cursoId === null || materiaId === null || profesorId === null) {
      setErrorForm("Completa el curso, la materia y el profesor");
      return;
    }
    try {
      setGuardando(true);
      setErrorForm("");
      await asignarDictado(token, { materiaId, cursoId, profesorId });
      await cargar();
      setEditando(null);
    } catch (e) {
      setErrorForm(e instanceof Error ? e.message : "No se pudo guardar el dictado");
    } finally {
      setGuardando(false);
    }
  };

  const eliminar = async (id: number) => {
    if (!token) return;
    try {
      await eliminarDictado(token, id);
      await cargar();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo eliminar el dictado");
    }
  };

  if (editando !== null) {
    const nuevo = editando === "nuevo";
    const cursoElegido = cursos.find((c) => c.id === cursoId);
    const materiasDelCurso = materias.filter((m) => cursoElegido && m.anio === cursoElegido.anio);

    return (
      <View style={styles.bloque}>
        <Text style={[styles.titulo, { color: theme.text, fontSize: fs(20) }]}>
          {nuevo ? "Nuevo dictado" : "Cambiar profesor"}
        </Text>

        {!nuevo && (
          <Text style={{ color: theme.muted, fontSize: fs(15) }}>{dictadoLabel(editando)}</Text>
        )}

        {nuevo && (
          <>
            <View>
              <Text style={[styles.label, { color: theme.text, fontSize: fs(14) }]}>Curso</Text>
              <Chips
                opciones={cursos.map((c) => ({ valor: c.id, label: cursoLabel(c.anio, c.division) }))}
                valor={cursoId}
                onChange={(id) => {
                  setCursoId(id);
                  setMateriaId(null); // las materias dependen del año del curso
                }}
              />
            </View>

            <View>
              <Text style={[styles.label, { color: theme.text, fontSize: fs(14) }]}>Materia</Text>
              {cursoId === null ? (
                <Text style={{ color: theme.muted, fontSize: fs(14) }}>Elige primero un curso.</Text>
              ) : materiasDelCurso.length === 0 ? (
                <Text style={{ color: theme.muted, fontSize: fs(14) }}>
                  No hay materias cargadas para ese año.
                </Text>
              ) : (
                <Chips
                  opciones={materiasDelCurso.map((m) => ({ valor: m.id, label: m.nombre }))}
                  valor={materiaId}
                  onChange={setMateriaId}
                />
              )}
            </View>
          </>
        )}

        <View>
          <Text style={[styles.label, { color: theme.text, fontSize: fs(14) }]}>Profesor</Text>
          {profesores.length === 0 ? (
            <Text style={{ color: theme.muted, fontSize: fs(14) }}>
              No hay usuarios con perfil Profesor.
            </Text>
          ) : (
            <Chips
              opciones={profesores.map((p) => ({ valor: p.id, label: p.nombre }))}
              valor={profesorId}
              onChange={setProfesorId}
            />
          )}
        </View>

        {!!errorForm && <Text style={{ color: theme.error, fontSize: fs(14) }}>{errorForm}</Text>}

        <Button title="Guardar" onPress={guardar} loading={guardando} />
        <Button variant="link" title="Cancelar" onPress={() => setEditando(null)} />
      </View>
    );
  }

  return (
    <View style={styles.bloque}>
      <View style={styles.encabezado}>
        <Text style={[styles.titulo, { color: theme.text, fontSize: fs(20), flex: 1 }]}>Dictados</Text>
        <Button style={styles.boton} title="+" onPress={() => abrirForm()} />
      </View>

      {!!error && <Text style={{ color: theme.error, fontSize: fs(14) }}>{error}</Text>}

      {cargando ? (
        <ActivityIndicator />
      ) : dictados.length === 0 ? (
        <Text style={{ color: theme.muted, fontSize: fs(15) }}>No hay dictados.</Text>
      ) : (
        dictados.map((d) => (
          <FilaAcciones
            key={d.id}
            titulo={dictadoLabel(d)}
            subtitulo={`Profesor: ${d.profesor}`}
            onEditar={() => abrirForm(d)}
            onEliminar={() => eliminar(d.id)}
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