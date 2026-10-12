import { useRef, useState } from "react";
import { Image, StyleSheet, View } from "react-native";
import { CameraType, CameraView, useCameraPermissions } from "expo-camera";
import PantallaHerramienta, { Aviso, Dato, Seccion } from "../../components/PantallaHerramienta";
import Button from "../../components/ui/Button";

export default function CamaraScreen() {
  const camara = useRef<CameraView>(null);
  const [permiso, pedirPermiso] = useCameraPermissions();
  const [lado, setLado] = useState<CameraType>("back");
  const [linterna, setLinterna] = useState(false);
  const [foto, setFoto] = useState<{ uri: string; width: number; height: number } | null>(null);
  const [error, setError] = useState("");

  if (!permiso) return <PantallaHerramienta titulo="Cámara"><Aviso texto="Cargando permisos..." /></PantallaHerramienta>;

  if (!permiso.granted) {
    return (
      <PantallaHerramienta titulo="Cámara">
        <Aviso texto="Se necesita permiso para usar la cámara." />
        <Button title="Dar permiso" onPress={pedirPermiso} />
      </PantallaHerramienta>
    );
  }

  const sacarFoto = async () => {
    try {
      setError("");
      const res = await camara.current?.takePictureAsync({ quality: 0.8 });
      if (res) setFoto({ uri: res.uri, width: res.width, height: res.height });
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo sacar la foto");
    }
  };

  return (
    <PantallaHerramienta titulo="Cámara">
      <View style={styles.preview}>
        <CameraView ref={camara} style={styles.camara} facing={lado} enableTorch={linterna} />
      </View>

      <Button title="Sacar foto" onPress={sacarFoto} />
      <Button
        variant="outline"
        title={`Usar cámara ${lado === "back" ? "frontal" : "trasera"}`}
        onPress={() => setLado((l) => (l === "back" ? "front" : "back"))}
      />
      <Button
        variant="outline"
        title={linterna ? "Apagar linterna" : "Encender linterna"}
        onPress={() => setLinterna((v) => !v)}
      />

      {!!error && <Aviso texto={error} error />}

      {foto && (
        <Seccion titulo="Última foto">
          <Image source={{ uri: foto.uri }} style={styles.foto} resizeMode="contain" />
          <Dato etiqueta="Resolución" valor={`${foto.width} x ${foto.height}`} />
        </Seccion>
      )}
    </PantallaHerramienta>
  );
}

const styles = StyleSheet.create({
  preview: { width: "100%", aspectRatio: 3 / 4, maxHeight: 460, borderRadius: 16, overflow: "hidden" },
  camara: { flex: 1 },
  foto: { width: "100%", height: 240, borderRadius: 12 },
});