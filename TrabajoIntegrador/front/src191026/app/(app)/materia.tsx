import { useCallback, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import Pantalla from "../../components/Pantalla";
import EstadoTexto from "../../components/ui/EstadoTexto";
import Tarjeta from "../../components/ui/Tarjeta";
import { useTheme } from "../../constants/theme";
import { useAuth } from "../../hooks/useAuth";
import { useResponsive } from "../../hooks/useResponsive";
import { historialPropio } from "../../services/asistenciaService";
import { AsistenciaPropia } from "../../types/academico";
import { fechaLarga, porcentaje } from "../../utils/formato";

export default function MateriaScreen() {
  const theme = useTheme();
  const { fs } = useResponsive();
  const { token } = useAuth();
  const { id, titulo } = useLocalSearchParams<{ id: string; titulo?: string }>();

  const [filas, setFilas] = useState<AsistenciaPropia[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useFocusEffect(
    useCallback(() => {
      if (!token) return;
      historialPropio(token, Number(id))
        .then((lista) => {
          setFilas(lista);
          setError("");
        })
        .catch((e) => setError(e instanceof Error ? e.message : "No se pudo cargar el historial"))
        .finally(() => setCargando(false));
    }, [token, id])
  );

  const presentes = filas.filter((f) => f.estado === "presente").length;
  const pct = porcentaje(presentes, filas.length);

  return (
    <Pantalla volver>
      <Text style={[styles.titulo, { color: theme.text, fontSize: fs(24) }]}>{titulo}</Text>

      <Tarjeta>
        {!!error && <Text style={{ color: theme.error, fontSize: fs(14) }}>{error}</Text>}

        {cargando ? (
          <ActivityIndicator />
        ) : filas.length === 0 ? (
          <Text style={{ color: theme.muted, fontSize: fs(15) }}>Todavía no hay clases registradas.</Text>
        ) : (
          <>
            <Text
              style={{
                color: pct >= 75 ? theme.success : theme.error,
                fontSize: fs(20),
                fontWeight: "800",
              }}
            >
              {presentes}/{filas.length} ({pct}% de asistencia)
            </Text>

            {filas.map((f) => (
              <View key={f.fecha} style={[styles.fila, { borderColor: theme.border }]}>
                <View style={styles.filaTop}>
                  <Text style={{ color: theme.text, fontSize: fs(15), flex: 1 }}>{fechaLarga(f.fecha)}</Text>
                  <EstadoTexto estado={f.estado} />
                </View>
                {f.estado === "ausente" && !!f.nota && (
                  <Text style={{ color: theme.muted, fontSize: fs(14) }}>Nota del profesor: {f.nota}</Text>
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
  titulo: { fontWeight: "800", letterSpacing: -0.3 },
  fila: { borderWidth: 1, borderRadius: 12, padding: 14, gap: 6 },
  filaTop: { flexDirection: "row", alignItems: "center", gap: 12 },
});