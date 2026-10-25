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
import { editarJustificacion, pedirJustificacion } from "../../services/justificacionService";
import { fechaLarga } from "../../utils/formato";
import { soloLetras, validar } from "../../utils/validaciones";

type Imagen = { uri: string; base64: string; mime: string };
const MIMES = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 4 * 1024 * 1024;

export default function JustificarScreen() {
  const router = useRouter();
  const { token } = useAuth();

  const { asistenciaId, fecha, titulo, justificacionId, motivo: motivoInicial, tieneAdjunto } = useLocalSearchParams<{
    asistenciaId: string;
    fecha: string;
    titulo?: string;
    justificacionId?: string;
    motivo?: string;
    tieneAdjunto?: string;
  }>();

  const editando = !!justificacionId;
  const [motivo, setMotivo] = useState(soloLetras(motivoInicial ?? ""));
  const [quitarAdjunto, setQuitarAdjunto] = useState(false);
  const [submitted, setSubmitted] = useState(false);
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
      if (!MIMES.includes(a.mimeType ?? "image/jpeg")) return setError("La imagen debe ser JPG, PNG o WEBP");
      if ((a.base64.length * 3) / 4 > MAX_BYTES) return setError("La imagen debe pesar menos de 4 MB");
      setQuitarAdjunto(false);
      setImagen({ uri: a.uri, base64: a.base64, mime: a.mimeType ?? "image/jpeg" });
    } catch {
      setError("No se pudo cargar la imagen");
    }
  };

  const enviar = async () => {
    if (!token) return;
    setSubmitted(true);
    setError("");
    const idValido = Number(editando ? justificacionId : asistenciaId);
    if (!Number.isInteger(idValido) || idValido < 1) return setError(editando ? "Pedido inválido" : "Falta inválida");
    if (validar.motivo(motivo)) return;
    try {
      setEnviando(true);
      setError("");
      if (editando) {
        await editarJustificacion(token, {
          id: idValido,
          motivo: motivo.trim(),
          adjuntoBase64: imagen?.base64,
          adjuntoMime: imagen?.mime,
          quitarAdjunto,
        });
      } else {
        await pedirJustificacion(token, {
          asistenciaId: idValido,
          motivo: motivo.trim(),
          adjuntoBase64: imagen?.base64,
          adjuntoMime: imagen?.mime,
        });
      }
      router.replace("./justificaciones");
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo enviar el pedido");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Pantalla volver>
      <Texto size={24} bold>{editando ? "Editar justificación" : "Pedir justificación"}</Texto>
      <Tarjeta>
        <Texto color="muted">{titulo} · {fecha ? fechaLarga(fecha) : ""}</Texto>
        <Input label="Motivo de la falta (solo letras)" value={motivo} onChangeText={(v) => setMotivo(soloLetras(v))}
          multiline numberOfLines={4} maxLength={500} autoCapitalize="sentences"
          validate={validar.motivo} submitted={submitted} />
        <Texto size={14} bold>Certificado médico o nota firmada (opcional)</Texto>
        <Button variant="outline" title="Elegir de la galería" onPress={() => elegir(false)} />
        {Platform.OS !== "web" && <Button variant="outline" title="Sacar una foto" onPress={() => elegir(true)} />}
        {editando && !!tieneAdjunto && !imagen &&
          (quitarAdjunto ? (
            <>
              <Texto size={14} color="muted">Se quitará el certificado al guardar.</Texto>
              <Button variant="link" title="Deshacer" onPress={() => setQuitarAdjunto(false)} />
            </>
          ) : (
            <>
              <Texto size={14} color="muted">Ya tiene un certificado adjunto. Si no eliges otra imagen, se conserva.</Texto>
              <Button variant="link" title="Quitar certificado" onPress={() => setQuitarAdjunto(true)} />
            </>
          ))}
        {imagen && <Image source={{ uri: imagen.uri }} style={styles.imagen} resizeMode="contain" />}
        {!!error && <Texto size={14} color="error">{error}</Texto>}
        <Button title={editando ? "Guardar cambios" : "Enviar pedido"} onPress={enviar} loading={enviando} />
      </Tarjeta>
    </Pantalla>
  );
}

const styles = StyleSheet.create({ imagen: { width: "100%", height: 260, borderRadius: 8 } });