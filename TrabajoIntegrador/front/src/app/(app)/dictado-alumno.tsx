import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import Pantalla from "../../components/layout/Pantalla"
import Button from "../../components/ui/Button";
import EstadoTexto from "../../components/ui/EstadoTexto";
import Input from "../../components/ui/Input";
import Tarjeta from "../../components/ui/Tarjeta";
import { useTheme } from "../../constants/theme";
import { useAuth } from "../../hooks/useAuth";
import { useResponsive } from "../../hooks/useResponsive";
import { historialAlumno, ponerNota } from "../../services/asistenciaService";
import { AsistenciaAlumno } from "../../types/academico";
import { fechaLarga, porcentaje } from "../../utils/formato";
import { soloLetras, validar } from "../../utils/validaciones";

export default function DictadoAlumnoScreen() {
  const theme = useTheme();
  const { fs } = useResponsive();
  const { token } = useAuth();
  const { dictadoId, alumnoId, titulo } = useLocalSearchParams<{
    dictadoId: string;
    alumnoId: string;
    titulo?: string;
  }>();

  const [nombre, setNombre] = useState("");
  const [filas, setFilas] = useState<AsistenciaAlumno[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [editando, setEditando] = useState<number | null>(null); // id de la asistencia
  const [texto, setTexto] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const cargar = useCallback(async () => {
    if (!token) return;
    try {
      const res = await historialAlumno(token, Number(dictadoId), Number(alumnoId));
      setNombre(res.alumno.nombre);
      setFilas(res.asistencias);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo cargar el historial");
    } finally {
      setCargando(false);
    }
  }, [token, dictadoId, alumnoId]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const abrirNota = (fila: AsistenciaAlumno) => {
    setEditando(fila.id);
    setSubmitted(false);
    setTexto(fila.nota ?? "");
  };

  const guardarNota = async () => {
    setSubmitted(true);
    if (!token || editando === null || validar.notaAusencia(texto)) return;
    try {
      setGuardando(true);
      setError("");
      await ponerNota(token, editando, texto.trim());
      setEditando(null);
      await cargar();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo guardar la nota");
    } finally {
      setGuardando(false);
    }
  };

  const presentes = filas.filter((f) => f.estado === "presente").length;

  return (
    <Pantalla volver>
      <View style={styles.encabezado}>
        <Text style={[styles.titulo, { color: theme.text, fontSize: fs(24) }]}>{nombre}</Text>
        <Text style={{ color: theme.muted, fontSize: fs(15) }}>{titulo}</Text>
      </View>
      <Tarjeta>
        {!!error && <Text style={{ color: theme.error, fontSize: fs(14) }}>{error}</Text>}
        {cargando ? (
          <ActivityIndicator />
        ) : filas.length === 0 ? (
          <Text style={{ color: theme.muted, fontSize: fs(15) }}>Todavía no hay clases registradas.</Text>
        ) : (
          <>
            <Text style={{ color: theme.text, fontSize: fs(16), fontWeight: "700" }}>
              {presentes}/{filas.length} ({porcentaje(presentes, filas.length)}% de asistencia)
            </Text>
            {filas.map((f) => (
              <View key={f.fecha} style={[styles.fila, { borderColor: theme.border }]}>
                <View style={styles.filaTop}>
                  <Text style={{ color: theme.text, fontSize: fs(15), flex: 1 }}>{fechaLarga(f.fecha)}</Text>
                  <EstadoTexto estado={f.estado} />
                </View>
                {/* La nota solo se puede poner en inasistencias que tienen registro (id) */}
                {f.estado === "ausente" && f.id !== null && (
                  editando === f.id ? (
                    <View style={styles.nota}>
                      <Input
                        label="Nota (solo letras, opcional)"
                        value={texto}
                        onChangeText={(v) => setTexto(soloLetras(v))}
                        autoCapitalize="sentences"
                        maxLength={255}
                        validate={validar.notaAusencia}
                        submitted={submitted}
                        placeholder="Ej: Justificó con certificado"
                      />
                      <Button title="Guardar nota" onPress={guardarNota} loading={guardando} />
                      <Button variant="link" title="Cancelar" onPress={() => setEditando(null)} />
                    </View>
                  ) : (
                    <View style={styles.nota}>
                      {!!f.nota && <Text style={{ color: theme.muted, fontSize: fs(14) }}>Nota: {f.nota}</Text>}
                      <Button
                        variant="link"
                        title={f.nota ? "Editar nota" : "Agregar nota"}
                        style={styles.linkIzq}
                        onPress={() => abrirNota(f)}
                      />
                    </View>
                  )
                )}
              </View>
            ))}
          </>
        )}
      </Tarjeta>
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  encabezado: { gap: 4 },
  titulo: { fontWeight: "800", letterSpacing: -0.3 },
  fila: { borderWidth: 1, borderRadius: 12, padding: 14, gap: 8 },
  filaTop: { flexDirection: "row", alignItems: "center", gap: 12 },
  nota: { gap: 6 },
  linkIzq: { alignSelf: "flex-start" },
});