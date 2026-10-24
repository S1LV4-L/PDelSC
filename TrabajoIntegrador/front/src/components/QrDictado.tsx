import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { useTheme } from "../constants/theme";
import { useAuth } from "../hooks/useAuth";
import { useResponsive } from "../hooks/useResponsive";
import { ApiError } from "../services/api";
import { cerrarToma, generarQr, qrDinamico, qrHoy } from "../services/asistenciaService";
import { QrClase } from "../types/academico";
import { formatoTiempo } from "../utils/formato";
import Button from "./ui/Button";
import Chips from "./ui/Chips";
import Texto from "./ui/Texto";

const DURACIONES = [15, 30, 60].map((n) => ({ valor: n, label: `${n} min` }));
type Props = { dictadoId: number; onCambio: () => void };

export default function QrDictado({ dictadoId, onCambio }: Props) {
  const theme = useTheme();
  const { isDesktop } = useResponsive();
  const { token } = useAuth();
  const [clase, setClase] = useState<QrClase | null>(null);
  const [payload, setPayload] = useState<string | null>(null);
  const [restante, setRestante] = useState(0); // segundos que le quedan a la toma
  const [renovaEn, setRenovaEn] = useState(0); // segundos hasta pedir un QR nuevo
  const [duracion, setDuracion] = useState<number | null>(15);
  const [cargando, setCargando] = useState(true);
  const [generando, setGenerando] = useState(false);
  const [cerrando, setCerrando] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const [error, setError] = useState("");
  const pidiendo = useRef(false);
  
  const aplicar = (c: QrClase | null) => {
    setClase(c);
    setRestante(c?.segundos_restantes ?? 0);
    if (!c) setPayload(null);
  };
  
  // Pide un QR firmado nuevo (cada 20 s) para que una foto del anterior no sirva
  const renovar = useCallback(async () => {
    if (!token || pidiendo.current) return;
    pidiendo.current = true;
    try {
      const r = await qrDinamico(token, dictadoId);
      setPayload(r.payload);
      setRestante(r.segundos_restantes);
      setRenovaEn(r.payload ? r.ventana : 0);
    } catch {
      setRenovaEn(3); // reintenta en 3 s
    } finally {
      pidiendo.current = false;
    }
  }, [token, dictadoId]);
  
  // QR de hoy (si el profesor ya lo generó)
  useEffect(() => {
    if (!token) return;
    qrHoy(token, dictadoId)
      .then(aplicar)
      .catch((e) => setError(e instanceof Error ? e.message : "No se pudo cargar el QR"))
      .finally(() => setCargando(false));
  }, [token, dictadoId]);
  // Primer QR firmado apenas hay toma
  
  useEffect(() => {
    if (clase) renovar();
  }, [clase, renovar]);
  // Cuentas regresivas
  
  useEffect(() => {
    if (!clase) return;
    const t = setInterval(() => {
      setRestante((r) => Math.max(0, r - 1));
      setRenovaEn((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(t);
  }, [clase]);
  
  // Al llegar a 0 pide el siguiente
  useEffect(() => {
    if (clase && restante > 0 && renovaEn === 0) renovar();
  }, [renovaEn, restante, clase, renovar]);
  
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
  
  const cerrar = async () => {
    if (!token) return;
    try {
      setCerrando(true);
      setError("");
      await cerrarToma(token, dictadoId);
      setRestante(0);
      setPayload(null);
      onCambio();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo cerrar la toma");
    } finally {
      setCerrando(false);
    }
  };
  if (cargando) return <ActivityIndicator />;

  const abierto = !!payload && restante > 0;

  return (
    <View style={styles.bloque}>
      <Texto size={18} bold>Código QR de asistencia</Texto>
      {abierto ? (
        <View style={styles.centro}>
          <View style={styles.qr}>
            <QRCode value={payload!} size={isDesktop ? 280 : 220} />
          </View>
          <Texto size={16} bold color="success">Toma abierta: {formatoTiempo(restante)}</Texto>
          <Texto size={14} color="muted">El código se renueva en {renovaEn} s</Texto>
          <Button variant="outline" title="Cerrar toma de asistencia" onPress={cerrar} loading={cerrando} />
        </View>
      ) : (
        <Texto color="muted">
          {clase ? "La toma de hoy está cerrada o venció." : "Todavía no generaste el QR de hoy."}
        </Texto>
      )}
      <View>
        <Texto size={14} bold style={styles.label}>Duración</Texto>
        <Chips opciones={DURACIONES} valor={duracion} onChange={setDuracion} deshabilitado={generando} />
      </View>
      {!!error && <Texto size={14} color="error">{error}</Texto>}
      {confirmando ? (
        <View style={[styles.aviso, { borderColor: theme.error }]}>
          <Texto bold color="error">¿Estás seguro que quieres volver a generar el QR?</Texto>
          <Texto size={14}>
            Esto sobrescribirá las asistencias de hoy: todos volverán a figurar como ausentes y se borrarán las
            notas. Queda registrado en la auditoría.
          </Texto>
          <Button title="Sí, volver a generar" onPress={() => generar(true)} loading={generando} />
          <Button variant="link" title="Cancelar" onPress={() => setConfirmando(false)} />
        </View>
      ) : (
        <Button
          title={clase ? "Volver a generar QR" : "Generar QR"}
          onPress={() => (clase ? setConfirmando(true) : generar(false))}
          loading={generando}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  bloque: { gap: 14 },
  label: { marginBottom: 6 },
  centro: { alignItems: "center", gap: 12 },
  qr: { backgroundColor: "#fff", padding: 14, borderRadius: 12 },
  aviso: { borderWidth: 1.5, borderRadius: 12, padding: 14, gap: 10 },
});