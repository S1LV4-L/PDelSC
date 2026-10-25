import { useState } from "react";
import { Image, Platform, StyleSheet } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import Pantalla from "../../components/Pantalla";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Tarjeta from "../../components/ui/Tarjeta";
import Texto from "../../components/ui/Texto";
import { useAuth } from "../../hooks/useAuth";
import { pedirJustificacion } from "../../services/justificacionService";
import { fechaLarga } from "../../utils/formato";

type Imagen = { uri: string; base64: string; mime: string };

export default function JustificarScreen() {
  const router = useRouter();
  const { token } = useAuth();
  const { asistenciaId, fecha, titulo } = useLocalSearchParams<{ asistenciaId: string; fecha: string; titulo?: string }>();
  const [motivo, setMotivo] = useState("");
  const [imagen, setImagen] = useState<Imagen | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  
  const elegir = async (camara: boolean) => {
    try {
      setError("");
      const opciones: ImagePicker.ImagePickerOptions = { mediaTypes: ["images"], quality: 0.5, base64: true };
      if (camara) {
        const permiso = await ImagePicker.requestCameraPermissionsAsync();
        if (!permiso.granted) return setError("Necesitamos permiso para usar la cámara");
      }
      const r = camara ? await ImagePicker.launchCameraAsync(opciones) : await ImagePicker.launchImageLibraryAsync(opciones);
      if (r.canceled) return;
      const a = r.assets[0];
      if (!a.base64) return setError("No se pudo leer la imagen");
      setImagen({ uri: a.uri, base64: a.base64, mime: a.mimeType ?? "image/jpeg" });
    } catch {
      setError("No se pudo cargar la imagen");
    }
  };
  
  const enviar = async () => {
    if (!token) return;
    if (motivo.trim().length < 5) return setError("Escribe el motivo de la falta (mínimo 5 caracteres)");
    try {
      setEnviando(true);
      setError("");
      await pedirJustificacion(token, {
        asistenciaId: Number(asistenciaId),
        motivo: motivo.trim(),
        adjuntoBase64: imagen?.base64,
        adjuntoMime: imagen?.mime,
      });
      router.replace("./justificaciones");
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo enviar el pedido");
    } finally {
      setEnviando(false);
    }
  };
  
  return (
    <Pantalla volver>
      <Texto size={24} bold>Pedir justificación</Texto>
      <Tarjeta>
        <Texto color="muted">{titulo} · {fecha ? fechaLarga(fecha) : ""}</Texto>
        <Input label="Motivo de la falta" value={motivo} onChangeText={setMotivo} multiline numberOfLines={4}
          maxLength={500} autoCapitalize="sentences" />
        <Texto size={14} bold>Certificado médico o nota firmada (opcional)</Texto>
        <Button variant="outline" title="Elegir de la galería" onPress={() => elegir(false)} />
        {Platform.OS !== "web" && <Button variant="outline" title="Sacar una foto" onPress={() => elegir(true)} />}
        {imagen && <Image source={{ uri: imagen.uri }} style={styles.imagen} resizeMode="contain" />}
        {!!error && <Texto size={14} color="error">{error}</Texto>}
        <Button title="Enviar pedido" onPress={enviar} loading={enviando} />
      </Tarjeta>
    </Pantalla>
  );
}

const styles = StyleSheet.create({ imagen: { width: "100%", height: 260, borderRadius: 8 } });