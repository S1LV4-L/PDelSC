import { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { useTheme } from "../../constants/theme";
import { useAuth } from "../../hooks/useAuth";
import { resumenPropio } from "../../services/asistenciaService";
import { FilaPresentismo } from "../../types/academico";
import { colorPresentismo, dictadoLabel, etiquetaPresentismo } from "../../utils/formato";
import CabeceraUsuario from "../../components/layout/CabeceraUsuario"
import Pantalla from "../../components/layout/Pantalla"
import Button from "../ui/Button";
import FilaItem from "../ui/FilaItem";
import Pct from "../ui/Pct";
import Tarjeta from "../ui/Tarjeta";
import Texto from "../ui/Texto";

export default function HomeAlumno() {
  const theme = useTheme();
  const router = useRouter();
  const { token } = useAuth();
  const [items, setItems] = useState<FilaPresentismo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  
  useFocusEffect(
    useCallback(() => {
      if (!token) return;
      resumenPropio(token)
        .then((lista) => {
          setItems(lista);
          setError("");
        })
        .catch((e) => setError(e instanceof Error ? e.message : "No se pudieron cargar tus materias"))
        .finally(() => setCargando(false));
    }, [token])
  );
  
  const global = useMemo(() => {
    const clases = items.reduce((a, i) => a + i.clases, 0);
    const presentes = items.reduce((a, i) => a + i.presentes, 0);
    return { clases, presentes, pct: clases ? Math.round((100 * presentes) / clases) : null };
  }, [items]);
  
  const colorGlobal = colorPresentismo(global.pct, theme);
  
  return (
    <Pantalla>
      <CabeceraUsuario />
      <Tarjeta>
        <Button title="Escanear QR" onPress={() => router.push("./escanear")} />
        <Button variant="outline" title="Calendario de asistencia" onPress={() => router.push("./calendario")} />
        <Button variant="outline" title="Mis justificaciones" onPress={() => router.push("./justificaciones")} />
      </Tarjeta>
      <Tarjeta>
        <Texto size={20} bold>Mi asistencia</Texto>
        {!!error && <Texto size={14} color="error">{error}</Texto>}
        {cargando ? (
          <ActivityIndicator />
        ) : (
          <View style={styles.global}>
            <View style={[styles.punto, { backgroundColor: colorGlobal }]} />
            <View>
              <Texto size={28} bold color={colorGlobal}>{global.pct === null ? "—" : `${global.pct}%`}</Texto>
              <Texto size={14} color="muted">
                {etiquetaPresentismo(global.pct)} · {global.presentes}/{global.clases} clases
              </Texto>
            </View>
          </View>
        )}
        <Texto size={12} color="muted">Verde: 85% o más · Amarillo: 75% a 84% · Rojo: menos de 75%</Texto>
      </Tarjeta>
      <Tarjeta>
        <Texto size={20} bold>Mis materias</Texto>
        {cargando ? (
          <ActivityIndicator />
        ) : items.length === 0 ? (
          <Texto color="muted">Todavía no tienes materias asignadas. Consulta con el administrador.</Texto>
        ) : (
          items.map((m) => (
            <FilaItem
              key={m.dictado_id}
              titulo={dictadoLabel(m)}
              subtitulo={`${m.presentes}/${m.clases} clases${m.justificadas ? ` · ${m.justificadas} justificadas` : ""}`}
              derecha={<Pct valor={m.porcentaje} />}
              onPress={() =>
                router.push({
                  pathname: "./materia",
                  params: { id: String(m.dictado_id), titulo: dictadoLabel(m) },
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
  global: { flexDirection: "row", alignItems: "center", gap: 16 },
  punto: { width: 22, height: 22, borderRadius: 11 },
});