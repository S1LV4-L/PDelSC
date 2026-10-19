import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../../constants/theme";
import { useAuth } from "../../hooks/useAuth";
import { useResponsive } from "../../hooks/useResponsive";
import {
  actualizarMateria,
  crearMateria,
  eliminarMateria,
  listarMaterias,
} from "../../services/academicoService";
import { Materia } from "../../types/academico";
import Button from "../ui/Button";
import Chips from "../ui/Chips";
import FilaAcciones from "../ui/FilaAcciones";
import Input from "../ui/Input";

const ANIOS = [1, 2, 3, 4, 5, 6, 7].map((n) => ({ valor: n, label: `${n}°` }));

const validarNombre = (v: string) => (v.trim() ? null : "El nombre es obligatorio");

export default function AdminMaterias() {
  const theme = useTheme();
  const { fs } = useResponsive();
  const { token } = useAuth();

  const [materias, setMaterias] = useState<Materia[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [editando, setEditando] = useState<Materia | "nueva" | null>(null);
  const [nombre, setNombre] = useState("");
  const [anio, setAnio] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [errorForm, setErrorForm] = useState("");

  const cargar = useCallback(async () => {
    if (!token) return;
    try {
      setError("");
      setMaterias(await listarMaterias(token));
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudieron cargar las materias");
    } finally {
      setCargando(false);
    }
  }, [token]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const abrirForm = (materia?: Materia) => {
    setEditando(materia ?? "nueva");
    setNombre(materia?.nombre ?? "");
    setAnio(materia?.anio ?? null);
    setSubmitted(false);
    setErrorForm("");
  };

  const guardar = async () => {
    setSubmitted(true);
    if (!token || anio === null || validarNombre(nombre)) return;
    try {
      setGuardando(true);
      setErrorForm("");
      const datos = { nombre: nombre.trim(), anio };
      if (editando === "nueva") await crearMateria(token, datos);
      else if (editando) await actualizarMateria(token, { id: editando.id, ...datos });
      await cargar();
      setEditando(null);
    } catch (e) {
      setErrorForm(e instanceof Error ? e.message : "No se pudo guardar la materia");
    } finally {
      setGuardando(false);
    }
  };

  const eliminar = async (id: number) => {
    if (!token) return;
    try {
      await eliminarMateria(token, id);
      await cargar();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo eliminar la materia");
    }
  };

  if (editando !== null) {
    return (
      <View style={styles.bloque}>
        <Text style={[styles.titulo, { color: theme.text, fontSize: fs(20) }]}>
          {editando === "nueva" ? "Nueva materia" : "Editar materia"}
        </Text>

        <Input
          label="Nombre"
          value={nombre}
          onChangeText={setNombre}
          autoCapitalize="sentences"
          placeholder="Ej: Matemática"
          validate={validarNombre}
          submitted={submitted}
        />

        <View>
          <Text style={[styles.label, { color: theme.text, fontSize: fs(14) }]}>Año</Text>
          <Chips opciones={ANIOS} valor={anio} onChange={setAnio} />
          {submitted && anio === null && (
            <Text style={{ color: theme.error, fontSize: fs(12), marginTop: 4 }}>Elige un año</Text>
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
        <Text style={[styles.titulo, { color: theme.text, fontSize: fs(20), flex: 1 }]}>Materias</Text>
        <Button style={styles.boton} title="+" onPress={() => abrirForm()} />
      </View>

      {!!error && <Text style={{ color: theme.error, fontSize: fs(14) }}>{error}</Text>}

      {cargando ? (
        <ActivityIndicator />
      ) : materias.length === 0 ? (
        <Text style={{ color: theme.muted, fontSize: fs(15) }}>No hay materias.</Text>
      ) : (
        materias.map((m) => (
          <FilaAcciones
            key={m.id}
            titulo={m.nombre}
            subtitulo={`${m.anio}° año`}
            onEditar={() => abrirForm(m)}
            onEliminar={() => eliminar(m.id)}
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