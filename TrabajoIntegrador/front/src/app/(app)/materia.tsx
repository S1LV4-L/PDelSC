import { useCallback, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import Pantalla from "../../components/layout/Pantalla"
import Button from "../../components/ui/Button";
import Chips from "../../components/ui/Chips";
import EstadoTexto from "../../components/ui/EstadoTexto";
import Pct from "../../components/ui/Pct";
import Tarjeta from "../../components/ui/Tarjeta";
import Texto from "../../components/ui/Texto";
import { useTheme } from "../../constants/theme";
import { useAuth } from "../../hooks/useAuth";
import { historialPropio } from "../../services/asistenciaService";
import { misCalificaciones } from "../../services/calificacionService";
import { AsistenciaPropia, Calificacion } from "../../types/academico";
import { fechaLarga, porcentaje, APRUEBA } from "../../utils/formato";

type Pestania = "asistencia" | "calificaciones";

const PESTANIAS = [
  { valor: "asistencia" as Pestania, label: "Asistencia" },
  { valor: "calificaciones" as Pestania, label: "Calificaciones" },
];

export default function MateriaScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { token } = useAuth();
  const { id, titulo } = useLocalSearchParams<{ id: string; titulo?: string }>();
  const [pestania, setPestania] = useState<Pestania>("asistencia");
  const [filas, setFilas] = useState<AsistenciaPropia[]>([]);
  const [notas, setNotas] = useState<Calificacion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  
  useFocusEffect(
    useCallback(() => {
      if (!token) return;
      Promise.all([historialPropio(token, Number(id)), misCalificaciones(token, Number(id))])
        .then(([h, n]) => {
          setFilas(h);
          setNotas(n);
          setError("");
        })
        .catch((e) => setError(e instanceof Error ? e.message : "No se pudo cargar la materia"))
        .finally(() => setCargando(false));
    }, [token, id])
  );
  
  const presentes = filas.filter((f) => f.estado === "presente").length;
  const pct = filas.length ? porcentaje(presentes, filas.length) : null;
  const promedio = notas.length ? notas.reduce((a, n) => a + n.nota, 0) / notas.length : null;
  const colorJust = (e: string) => (e === "aprobada" ? theme.success : e === "rechazada" ? theme.error : theme.muted);
  
  return (
    <Pantalla volver>
      <Texto size={24} bold>{titulo}</Texto>
      <Tarjeta>
        <Chips opciones={PESTANIAS} valor={pestania} onChange={setPestania} />
        {!!error && <Texto size={14} color="error">{error}</Texto>}
        {cargando ? (
          <ActivityIndicator />
        ) : pestania === "asistencia" ? (
          filas.length === 0 ? (
            <Texto color="muted">Todavía no hay clases registradas.</Texto>
          ) : (
            <>
              <View style={styles.fila}>
                <Texto size={20} bold>{presentes}/{filas.length} clases</Texto>
                <Pct valor={pct} />
              </View>
              {filas.map((f) => (
                <View key={f.fecha} style={[styles.item, { borderColor: theme.border }]}>
                  <View style={styles.fila}>
                    <Texto style={{ flex: 1 }}>{fechaLarga(f.fecha)}</Texto>
                    <EstadoTexto estado={f.estado} />
                  </View>
                  {f.estado === "ausente" && !!f.nota && (
                    <Texto size={14} color="muted">Nota del profesor: {f.nota}</Texto>
                  )}
                  {f.estado === "ausente" && !!f.justificacion && (
                    <Texto size={14} bold color={colorJust(f.justificacion)}>
                      Justificación {f.justificacion}
                    </Texto>
                  )}
                  {f.estado === "ausente" && f.id !== null && (!f.justificacion || f.justificacion === "rechazada") && (
                    <Button
                      variant="outline"
                      title={f.justificacion === "rechazada" ? "Volver a pedir justificación" : "Pedir justificación"}
                      onPress={() =>
                        router.push({
                          pathname: "./justificar",
                          params: { asistenciaId: String(f.id), fecha: f.fecha, titulo },
                        })
                      }
                    />
                  )}
                </View>
              ))}
            </>
          )
        ) : notas.length === 0 ? (
          <Texto color="muted">Todavía no tienes calificaciones en esta materia.</Texto>
        ) : (
          <>
            <Texto size={20} bold>Promedio: {promedio!.toFixed(2)}</Texto>
            {notas.map((n) => (
              <View key={n.id} style={[styles.item, styles.fila, { borderColor: theme.border }]}>
                <View style={{ flex: 1 }}>
                  <Texto bold>{n.titulo}</Texto>
                  <Texto size={14} color="muted">{fechaLarga(n.fecha)}</Texto>
                </View>
                <Texto size={20} bold color={n.nota >= APRUEBA ? "success" : "error"}>{n.nota}</Texto>
              </View>
            ))}
          </>
        )}
      </Tarjeta>
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  fila: { flexDirection: "row", alignItems: "center", gap: 12 },
  item: { borderWidth: 1, borderRadius: 12, padding: 14, gap: 8 },
});