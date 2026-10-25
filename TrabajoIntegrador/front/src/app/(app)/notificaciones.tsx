import { useCallback, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";
import { useFocusEffect } from "expo-router";
import Pantalla from "../../components/layout/Pantalla"
import Tarjeta from "../../components/ui/Tarjeta";
import Texto from "../../components/ui/Texto";
import { useTheme } from "../../constants/theme";
import { useAuth } from "../../hooks/useAuth";
import { comunicadosMios, marcarLeido } from "../../services/comunicadoService";
import { Comunicado } from "../../types/academico";

export default function NotificacionesScreen() {
  const theme = useTheme();
  const { token } = useAuth();
  const [lista, setLista] = useState<Comunicado[]>([]);
  const [abierto, setAbierto] = useState<number | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  
  useFocusEffect(
    useCallback(() => {
      if (!token) return;
      comunicadosMios(token)
        .then((l) => {
          setLista(l);
          setError("");
        })
        .catch((e) => setError(e instanceof Error ? e.message : "No se pudieron cargar las notificaciones"))
        .finally(() => setCargando(false));
    }, [token])
  );
  
  const abrir = async (c: Comunicado) => {
    setAbierto(abierto === c.id ? null : c.id);
    if (c.leido || !token) return;
    setLista((prev) => prev.map((x) => (x.id === c.id ? { ...x, leido: true } : x)));
    marcarLeido(token, c.id).catch(() => {});
  };
  
  return (
    <Pantalla>
      <Texto size={24} bold>Notificaciones</Texto>
      <Tarjeta>
        {!!error && <Texto size={14} color="error">{error}</Texto>}
        {cargando ? (
          <ActivityIndicator />
        ) : lista.length === 0 ? (
          <Texto color="muted">No tienes notificaciones.</Texto>
        ) : (
          lista.map((c) => (
            <Pressable key={c.id} onPress={() => abrir(c)} style={[styles.fila, { borderColor: c.leido ? theme.border : theme.primary }]}>
              <View style={styles.cabecera}>
                <Texto bold style={{ flex: 1 }}>{c.titulo}</Texto>
                {!c.leido && <Texto size={12} bold color="primary">NUEVO</Texto>}
              </View>
              <Texto size={13} color="muted">{c.fecha}{c.autor ? ` · ${c.autor}` : ""}</Texto>
              {abierto === c.id && <Texto>{c.mensaje}</Texto>}
            </Pressable>
          ))
        )}
      </Tarjeta>
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  fila: { borderWidth: 1.5, borderRadius: 12, padding: 14, gap: 6 },
  cabecera: { flexDirection: "row", alignItems: "center", gap: 12 },
});