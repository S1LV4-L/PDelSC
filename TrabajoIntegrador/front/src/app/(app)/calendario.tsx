import { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useFocusEffect } from "expo-router";
import Pantalla from "../../components/Pantalla";
import Button from "../../components/ui/Button";
import Tarjeta from "../../components/ui/Tarjeta";
import Texto from "../../components/ui/Texto";
import { useTheme } from "../../constants/theme";
import { useAuth } from "../../hooks/useAuth";
import { calendarioPropio } from "../../services/asistenciaService";
import { DiaCalendario } from "../../types/academico";
import { AMARILLO, mesISO } from "../../utils/formato";

const DIAS = ["L", "M", "X", "J", "V", "S", "D"];

export default function CalendarioScreen() {
  const theme = useTheme();
  const { token } = useAuth();
  const [mes, setMes] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [dias, setDias] = useState<Record<string, DiaCalendario>>({});
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  
  useFocusEffect(
    useCallback(() => {
      if (!token) return;
      setCargando(true);
      calendarioPropio(token, mesISO(mes))
        .then((l) => {
          setDias(Object.fromEntries(l.map((d) => [d.fecha, d])));
          setError("");
        })
        .catch((e) => setError(e instanceof Error ? e.message : "No se pudo cargar el calendario"))
        .finally(() => setCargando(false));
    }, [token, mes])
  );
  
  const celdas = useMemo(() => {
    const offset = (mes.getDay() + 6) % 7; // semana desde el lunes
    const total = new Date(mes.getFullYear(), mes.getMonth() + 1, 0).getDate();
    return [...Array(offset).fill(null), ...Array.from({ length: total }, (_, i) => i + 1)] as (number | null)[];
  }, [mes]);
  
  const mover = (delta: number) => setMes(new Date(mes.getFullYear(), mes.getMonth() + delta, 1));
  const color = (d?: DiaCalendario) =>
    !d ? theme.muted : d.presentes === d.total ? theme.success : d.presentes === 0 ? theme.error : AMARILLO;
  
  return (
    <Pantalla volver>
      <Texto size={24} bold>Calendario de asistencia</Texto>
      <Tarjeta>
        <View style={styles.nav}>
          <Button variant="outline" title="‹" style={styles.flecha} onPress={() => mover(-1)} />
          <Texto size={18} bold style={{ textTransform: "capitalize" }}>
            {mes.toLocaleDateString("es-AR", { month: "long", year: "numeric" })}
          </Texto>
          <Button variant="outline" title="›" style={styles.flecha} onPress={() => mover(1)} />
        </View>
        {!!error && <Texto size={14} color="error">{error}</Texto>}
        {cargando ? (
          <ActivityIndicator />
        ) : (
          <View style={styles.grilla}>
            {DIAS.map((d) => (
              <View key={d} style={styles.celda}><Texto size={13} bold color="muted">{d}</Texto></View>
            ))}
            {celdas.map((n, i) => {
              if (n === null) return <View key={`v${i}`} style={styles.celda} />;
              const clave = `${mesISO(mes)}-${String(n).padStart(2, "0")}`;
              const d = dias[clave];
              return (
                <View key={clave} style={styles.celda}>
                  <View style={[styles.dia, { borderColor: d ? color(d) : theme.border }]}>
                    <Texto size={12} color="muted">{n}</Texto>
                    {d && <Texto size={13} bold color={color(d)}>{d.presentes}/{d.total}</Texto>}
                  </View>
                </View>
              );
            })}
          </View>
        )}
        <Texto size={12} color="muted">
          Cada día muestra a cuántas clases asististe sobre el total (ej: 2/3). Verde: todas · Amarillo: algunas · Rojo: ninguna.
        </Texto>
      </Tarjeta>
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  nav: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  flecha: { paddingVertical: 8, paddingHorizontal: 16 },
  grilla: { flexDirection: "row", flexWrap: "wrap" },
  celda: { width: `${100 / 7}%`, padding: 2, alignItems: "center" },
  dia: { width: "100%", minHeight: 54, borderWidth: 1.5, borderRadius: 10, alignItems: "center", justifyContent: "center", gap: 2 },
});