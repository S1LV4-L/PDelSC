import { useCallback, useState } from "react";
import { ActivityIndicator, StyleSheet, Text } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { useTheme } from "../../constants/theme";
import { useAuth } from "../../hooks/useAuth";
import { useResponsive } from "../../hooks/useResponsive";
import { misMaterias } from "../../services/academicoService";
import { DictadoResumen } from "../../types/academico";
import { dictadoLabel } from "../../utils/formato";
import CabeceraUsuario from "../CabeceraUsuario";
import Pantalla from "../Pantalla";
import FilaItem from "../ui/FilaItem";
import Tarjeta from "../ui/Tarjeta";

export default function HomeProfesor() {
  const theme = useTheme();
  const router = useRouter();
  const { fs } = useResponsive();
  const { token } = useAuth();

  const [items, setItems] = useState<DictadoResumen[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useFocusEffect(
    useCallback(() => {
      if (!token) return;
      misMaterias(token)
        .then((lista) => {
          setItems(lista);
          setError("");
        })
        .catch((e) => setError(e instanceof Error ? e.message : "No se pudieron cargar tus materias"))
        .finally(() => setCargando(false));
    }, [token])
  );

  return (
    <Pantalla>
      <CabeceraUsuario />

      <Tarjeta>
        <Text style={[styles.titulo, { color: theme.text, fontSize: fs(20) }]}>Mis materias</Text>

        {!!error && <Text style={{ color: theme.error, fontSize: fs(14) }}>{error}</Text>}

        {cargando ? (
          <ActivityIndicator />
        ) : items.length === 0 ? (
          <Text style={{ color: theme.muted, fontSize: fs(15) }}>
            Todavía no tienes materias asignadas.
          </Text>
        ) : (
          items.map((m) => (
            <FilaItem
              key={m.id}
              titulo={dictadoLabel(m)}
              derecha={<Text style={{ color: theme.muted, fontSize: fs(20) }}>›</Text>}
              onPress={() =>
                router.push({
                  pathname: "./dictado",
                  params: { id: String(m.id), titulo: dictadoLabel(m) },
                })
              }
            />
          ))
        )}
      </Tarjeta>
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  titulo: { fontWeight: "800", letterSpacing: -0.3 },
});