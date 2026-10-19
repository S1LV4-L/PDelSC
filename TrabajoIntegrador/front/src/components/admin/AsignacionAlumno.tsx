import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../../constants/theme";
import { useAuth } from "../../hooks/useAuth";
import { useResponsive } from "../../hooks/useResponsive";
import {
  asignacionesAlumno,
  asignarCursoAlumno,
  asignarDictadosAlumno,
  listarCursos,
  listarDictados,
} from "../../services/academicoService";
import { Curso, Dictado } from "../../types/academico";
import { cursoLabel, dictadoLabel } from "../../utils/formato";
import Button from "../ui/Button";
import Chips from "../ui/Chips";

type Props = { alumnoId: number; nombre: string; onTerminar: () => void };

export default function AsignacionAlumno({ alumnoId, nombre, onTerminar }: Props) {
  const theme = useTheme();
  const { fs } = useResponsive();
  const { token } = useAuth();

  const [cursos, setCursos] = useState<Curso[]>([]);
  const [dictados, setDictados] = useState<Dictado[]>([]);
  const [cursoActual, setCursoActual] = useState<number | null>(null); // el guardado
  const [cursoElegido, setCursoElegido] = useState<number | null>(null);
  const [seleccion, setSeleccion] = useState<number[]>([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState<"curso" | "materias" | null>(null);
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");

  const cargar = useCallback(async () => {
    if (!token) return;
    try {
      setError("");
      const [c, d, a] = await Promise.all([
        listarCursos(token),
        listarDictados(token),
        asignacionesAlumno(token, alumnoId),
      ]);
      setCursos(c);
      setDictados(d);
      setCursoActual(a.curso?.id ?? null);
      setCursoElegido(a.curso?.id ?? null);
      setSeleccion(a.dictados.map((x) => x.id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudieron cargar los datos del alumno");
    } finally {
      setCargando(false);
    }
  }, [token, alumnoId]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const curso = cursos.find((c) => c.id === cursoActual);

  // Materias de su curso + recursadas de años anteriores (las del propio año, solo de su curso)
  const disponibles = curso
    ? dictados
        .filter((d) => d.anio < curso.anio || (d.anio === curso.anio && d.curso_id === curso.id))
        .sort((a, b) => b.anio - a.anio || a.materia.localeCompare(b.materia))
    : [];
  const anios = [...new Set(disponibles.map((d) => d.anio))];

  const alternar = (d: Dictado) =>
    setSeleccion((prev) => {
      if (prev.includes(d.id)) return prev.filter((i) => i !== d.id);
      // No se puede cursar la misma materia en dos cursos a la vez
      const mismaMateria = new Set(dictados.filter((x) => x.materia_id === d.materia_id).map((x) => x.id));
      return [...prev.filter((i) => !mismaMateria.has(i)), d.id];
    });

  const guardarCurso = async () => {
    if (!token || cursoElegido === null) return;
    try {
      setGuardando("curso");
      setError("");
      setAviso("");
      await asignarCursoAlumno(token, alumnoId, cursoElegido);
      await cargar();
      setAviso("Curso guardado");
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo guardar el curso");
    } finally {
      setGuardando(null);
    }
  };

  const guardarMaterias = async () => {
    if (!token) return;
    try {
      setGuardando("materias");
      setError("");
      setAviso("");
      await asignarDictadosAlumno(token, alumnoId, seleccion);
      setAviso("Materias guardadas");
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudieron guardar las materias");
    } finally {
      setGuardando(null);
    }
  };

  if (cargando) return <ActivityIndicator />;

  return (
    <View style={styles.bloque}>
      <Text style={[styles.titulo, { color: theme.text, fontSize: fs(20) }]}>Cursada de {nombre}</Text>

      {!!error && <Text style={{ color: theme.error, fontSize: fs(14) }}>{error}</Text>}
      {!!aviso && <Text style={{ color: theme.success, fontSize: fs(14), fontWeight: "600" }}>{aviso}</Text>}

      <View style={styles.seccion}>
        <Text style={[styles.label, { color: theme.text, fontSize: fs(15) }]}>Curso</Text>
        <Chips
          opciones={cursos.map((c) => ({ valor: c.id, label: cursoLabel(c.anio, c.division) }))}
          valor={cursoElegido}
          onChange={setCursoElegido}
        />
        {cursoElegido !== null && cursoElegido !== cursoActual && (
          <Button title="Guardar curso" onPress={guardarCurso} loading={guardando === "curso"} />
        )}
      </View>

      {curso ? (
        <View style={styles.seccion}>
          <Text style={[styles.label, { color: theme.text, fontSize: fs(15) }]}>Materias</Text>

          {disponibles.length === 0 ? (
            <Text style={{ color: theme.muted, fontSize: fs(14) }}>
              No hay materias dictadas para este curso. Crealas en Académico → Dictados.
            </Text>
          ) : (
            anios.map((anio) => (
              <View key={anio} style={styles.grupo}>
                <Text style={{ color: theme.muted, fontSize: fs(13), fontWeight: "700" }}>
                  {anio === curso.anio
                    ? `Materias de ${cursoLabel(curso.anio, curso.division)}`
                    : `Recursadas de ${anio}° año`}
                </Text>
                {disponibles
                  .filter((d) => d.anio === anio)
                  .map((d) => {
                    const activo = seleccion.includes(d.id);
                    return (
                      <Pressable
                        key={d.id}
                        onPress={() => alternar(d)}
                        style={[
                          styles.opcion,
                          {
                            borderColor: activo ? theme.primary : theme.border,
                            backgroundColor: activo ? theme.background : "transparent",
                          },
                        ]}
                      >
                        <Text style={{ color: theme.text, fontSize: fs(15) }}>
                          {activo ? "☑" : "☐"} {dictadoLabel(d)}
                        </Text>
                        <Text style={{ color: theme.muted, fontSize: fs(13) }}>Prof. {d.profesor}</Text>
                      </Pressable>
                    );
                  })}
              </View>
            ))
          )}

          {disponibles.length > 0 && (
            <Button title="Guardar materias" onPress={guardarMaterias} loading={guardando === "materias"} />
          )}
        </View>
      ) : (
        <Text style={{ color: theme.muted, fontSize: fs(14) }}>
          Guarda un curso para poder asignar materias.
        </Text>
      )}

      <Button variant="link" title="Volver a usuarios" onPress={onTerminar} />
    </View>
  );
}

const styles = StyleSheet.create({
  bloque: { gap: 16 },
  titulo: { fontWeight: "800", letterSpacing: -0.3 },
  seccion: { gap: 10 },
  label: { fontWeight: "700" },
  grupo: { gap: 8 },
  opcion: { borderWidth: 1, borderRadius: 12, padding: 12, gap: 2 },
});