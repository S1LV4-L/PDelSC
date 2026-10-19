import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { useTheme } from "../constants/theme";
import { useAuth } from "../hooks/useAuth";
import { useResponsive } from "../hooks/useResponsive";
import { ApiError } from "../services/api";
import { generarQr, qrHoy } from "../services/asistenciaService";
import { QrClase } from "../types/academico";
import { formatoTiempo } from "../utils/formato";
import Button from "./ui/Button";
import Chips from "./ui/Chips";

const DURACIONES = [15, 30, 60].map((n) => ({ valor: n, label: `${n} min` }));

type Props = { dictadoId: number; onCambio: () => void };

export default function QrDictado({ dictadoId, onCambio }: Props) {
  const theme = useTheme();
  const { fs, isDesktop } = useResponsive();
  const { token } = useAuth();

  const [clase, setClase] = useState<QrClase | null>(null);
  const [restante, setRestante] = useState(0);
  const [duracion, setDuracion] = useState<number | null>(15);
  const [cargando, setCargando] = useState(true);
  const [generando, setGenerando] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const [error, setError] = useState("");

  const aplicar = (c: QrClase | null) => {
    setClase(c);
    setRestante(c?.segundos_restantes ?? 0);
  };

  // QR de hoy (si el profesor ya lo generó)
  useEffect(() => {
    if (!token) return;
    qrHoy(token, dictadoId)
      .then(aplicar)
      .catch((e) => setError(e instanceof Error ? e.message : "No se pudo cargar el QR"))
      .finally(() => setCargando(false));
  }, [token, dictadoId]);

  // Cuenta regresiva
  useEffect(() => {
    if (!clase) return;
    const t = setInterval(() => setRestante((r) => Math.max(0, r - 1)), 1000);
    return () => clearInterval(t);
  }, [clase]);

  const generar = useCallback(
    async (reemplazar: boolean) => {
      if (!token || duracion === null) return;
      try {
        setGenerando(true);
        setError("");
        aplicar(await generarQr(token, dictadoId, duracion, reemplazar));
        setConfirmando(false);
        onCambio();
      } catch (e) {
        // El backend pide confirmación si ya había un QR hoy
        if (e instanceof ApiError && e.status === 409) setConfirmando(true);
        else setError(e instanceof Error ? e.message : "No se pudo generar el QR");
      } finally {
        setGenerando(false);
      }
    },
    [token, dictadoId, duracion, onCambio]
  );

  const alPresionar = () => (clase ? setConfirmando(true) : generar(false));

  if (cargando) return <ActivityIndicator />;

  return (
    <View style={styles.bloque}>
      <Text style={[styles.titulo, { color: theme.text, fontSize: fs(18) }]}>Código QR de asistencia</Text>

      {clase && restante > 0 ? (
        <View style={styles.centro}>
          <View style={styles.qr}>
            <QRCode value={clase.token} size={isDesktop ? 280 : 220} />
          </View>
          <Text style={{ color: theme.success, fontSize: fs(16), fontWeight: "700" }}>
            Vence en {formatoTiempo(restante)}
          </Text>
        </View>
      ) : (
        <Text style={{ color: theme.muted, fontSize: fs(15) }}>
          {clase ? "El QR de hoy ya venció." : "Todavía no generaste el QR de hoy."}
        </Text>
      )}

      <View>
        <Text style={[styles.label, { color: theme.text, fontSize: fs(14) }]}>Duración</Text>
        <Chips opciones={DURACIONES} valor={duracion} onChange={setDuracion} deshabilitado={generando} />
      </View>

      {!!error && <Text style={{ color: theme.error, fontSize: fs(14) }}>{error}</Text>}

      {confirmando ? (
        <View style={[styles.aviso, { borderColor: theme.error }]}>
          <Text style={{ color: theme.error, fontSize: fs(15), fontWeight: "700" }}>
            ¿Estás seguro que quieres volver a generar el QR?
          </Text>
          <Text style={{ color: theme.text, fontSize: fs(14) }}>
            Esto sobrescribirá las asistencias de hoy: todos volverán a figurar como ausentes y se borrarán las
            notas.
          </Text>
          <Button title="Sí, volver a generar" onPress={() => generar(true)} loading={generando} />
          <Button variant="link" title="Cancelar" onPress={() => setConfirmando(false)} />
        </View>
      ) : (
        <Button
          title={clase ? "Volver a generar QR" : "Generar QR"}
          onPress={alPresionar}
          loading={generando}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  bloque: { gap: 14 },
  titulo: { fontWeight: "800", letterSpacing: -0.3 },
  label: { fontWeight: "600", marginBottom: 6 },
  centro: { alignItems: "center", gap: 12 },
  qr: { backgroundColor: "#fff", padding: 14, borderRadius: 12 },
  aviso: { borderWidth: 1.5, borderRadius: 12, padding: 14, gap: 10 },
});