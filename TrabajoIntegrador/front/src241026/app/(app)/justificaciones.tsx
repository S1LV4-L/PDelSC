import { useCallback, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useFocusEffect } from "expo-router";
import Pantalla from "../../components/Pantalla";
import Tarjeta from "../../components/ui/Tarjeta";
import Texto from "../../components/ui/Texto";
import { useTheme } from "../../constants/theme";
import { useAuth } from "../../hooks/useAuth";
import { justificacionesPropias } from "../../services/justificacionService";
import { Justificacion } from "../../types/academico";
import { AMARILLO, dictadoLabel, fechaLarga } from "../../utils/formato";

export default function JustificacionesScreen() {
  const theme = useTheme();
  const { token } = useAuth();
  const [lista, setLista] = useState<Justificacion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  
  useFocusEffect(
    useCallback(() => {
      if (!token) return;
      justificacionesPropias(token)
        .then((l) => {
          setLista(l);
          setError("");
        })
        .catch((e) => setError(e instanceof Error ? e.message : "No se pudieron cargar tus pedidos"))
        .finally(() => setCargando(false));
    }, [token])
  );
  
  const color = (e: Justificacion["estado"]) => (e === "aprobada" ? theme.success : e === "rechazada" ? theme.error : AMARILLO);
  
  return (
    <Pantalla volver>
      <Texto size={24} bold>Mis justificaciones</Texto>
      <Tarjeta>
        {!!error && <Texto size={14} color="error">{error}</Texto>}
        {cargando ? (
          <ActivityIndicator />
        ) : lista.length === 0 ? (
          <Texto color="muted">No pediste justificaciones. Puedes hacerlo desde una falta en la materia.</Texto>
        ) : (
          lista.map((j) => (
            <View key={j.id} style={[styles.fila, { borderColor: theme.border }]}>
              <View style={styles.cabecera}>
                <Texto bold style={{ flex: 1 }}>{dictadoLabel(j)}</Texto>
                <Texto bold color={color(j.estado)}>{j.estado.toUpperCase()}</Texto>
              </View>
              <Texto size={14} color="muted">{fechaLarga(j.fecha)}</Texto>
              <Texto>{j.motivo}</Texto>
              {j.tiene_adjunto && <Texto size={13} color="muted">Con certificado adjunto</Texto>}
              {!!j.respuesta && <Texto size={14} color="muted">Respuesta de preceptoría: {j.respuesta}</Texto>}
            </View>
          ))
        )}
      </Tarjeta>
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  fila: { borderWidth: 1, borderRadius: 12, padding: 14, gap: 6 },
  cabecera: { flexDirection: "row", alignItems: "center", gap: 12 },
});