import { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import Pantalla from "../../components/Pantalla";
import Button from "../../components/ui/Button";
import Tarjeta from "../../components/ui/Tarjeta";
import { useTheme } from "../../constants/theme";
import { useAuth } from "../../hooks/useAuth";
import { useResponsive } from "../../hooks/useResponsive";
import { escanearQr } from "../../services/asistenciaService";

type Resultado = { ok: boolean; mensaje: string };

export default function EscanearScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { fs } = useResponsive();
  const { token } = useAuth();

  const [permiso, pedirPermiso] = useCameraPermissions();
  const [bloqueado, setBloqueado] = useState(false);
  const [resultado, setResultado] = useState<Resultado | null>(null);

  const alEscanear = async ({ data }: { data: string }) => {
    if (bloqueado || !token) return;
    setBloqueado(true); // evita registrar el mismo QR varias veces seguidas
    try {
      await escanearQr(token, data);
      setResultado({ ok: true, mensaje: "Asistencia registrada" });
    } catch (e) {
      setResultado({
        ok: false,
        mensaje: e instanceof Error ? e.message : "No se pudo registrar la asistencia",
      });
    }
  };

  const reintentar = () => {
    setResultado(null);
    setBloqueado(false);
  };

  if (!permiso) {
    return (
      <Pantalla volver>
        <ActivityIndicator />
      </Pantalla>
    );
  }

  if (!permiso.granted) {
    return (
      <Pantalla volver>
        <Tarjeta>
          <Text style={{ color: theme.text, fontSize: fs(16) }}>
            Necesitamos acceso a la cámara para escanear el código QR.
          </Text>
          <Button title="Permitir cámara" onPress={pedirPermiso} />
        </Tarjeta>
      </Pantalla>
    );
  }

  return (
    <Pantalla volver>
      <Text style={[styles.titulo, { color: theme.text, fontSize: fs(24) }]}>Escanear QR</Text>

      {resultado ? (
        <Tarjeta>
          <Text
            style={{
              color: resultado.ok ? theme.success : theme.error,
              fontSize: fs(20),
              fontWeight: "800",
            }}
          >
            {resultado.ok ? "¡Listo!" : "No se pudo registrar"}
          </Text>
          <Text style={{ color: theme.text, fontSize: fs(16) }}>{resultado.mensaje}</Text>
          {!resultado.ok && <Button title="Intentar de nuevo" onPress={reintentar} />}
          <Button
            variant={resultado.ok ? "primary" : "link"}
            title="Volver a mis materias"
            onPress={() => router.back()}
          />
        </Tarjeta>
      ) : (
        <View style={[styles.marco, { borderColor: theme.border }]}>
          <CameraView
            style={styles.camara}
            facing="back"
            barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
            onBarcodeScanned={bloqueado ? undefined : alEscanear}
          />
        </View>
      )}
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  titulo: { fontWeight: "800", letterSpacing: -0.3 },
  marco: {
    width: "100%",
    maxWidth: 480,
    aspectRatio: 1,
    alignSelf: "center",
    borderRadius: 20,
    borderWidth: 1,
    overflow: "hidden",
  },
  camara: { flex: 1 },
});