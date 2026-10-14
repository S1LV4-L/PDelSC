import { useState } from "react";
import { Linking, StyleSheet, View } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Clipboard from "expo-clipboard";
import QRCode from "react-native-qrcode-svg";
import PantallaHerramienta, { Aviso, Dato, Seccion } from "../../components/PantallaHerramienta";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

export default function EscanerScreen() {
  const [permiso, pedirPermiso] = useCameraPermissions();
  const [escaneando, setEscaneando] = useState(true);
  const [resultado, setResultado] = useState<{ tipo: string; dato: string } | null>(null);
  const [copiado, setCopiado] = useState(false);
  const [texto, setTexto] = useState("https://expo.dev");

  // Callback que se ejecuta al detectar un código; detiene el escaneo
  const manejarCodigo = ({ type, data }: { type: string; data: string }) => {
    setResultado({ tipo: type, dato: data });
    setEscaneando(false);
  };

  const copiar = async () => {
    if (!resultado) return;
    await Clipboard.setStringAsync(resultado.dato);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const reiniciar = () => {
    setResultado(null);
    setEscaneando(true);
  };

  return (
    <PantallaHerramienta titulo="Lector de códigos y QR">
      <Seccion titulo="Escanear">
        {permiso?.granted ? (
          <View style={styles.preview}>
            <CameraView
              style={styles.camara}
              onBarcodeScanned={escaneando ? manejarCodigo : undefined}
              barcodeScannerSettings={{
                barcodeTypes: ["qr", "ean13", "ean8", "code128", "code39", "upc_a", "upc_e", "pdf417", "datamatrix"],
              }}
            />
          </View>
        ) : (
          <>
            <Aviso texto="Se necesita permiso de cámara para escanear." />
            <Button title="Dar permiso" onPress={pedirPermiso} />
          </>
        )}

        {resultado ? (
          <>
            <Dato etiqueta="Tipo" valor={resultado.tipo} />
            <Dato etiqueta="Contenido" valor={resultado.dato} />
            <Button variant="outline" title={copiado ? "Copiado" : "Copiar contenido"} onPress={copiar} />
            {/^https?:\/\//i.test(resultado.dato) && (
              <Button variant="outline" title="Abrir enlace" onPress={() => Linking.openURL(resultado.dato)} />
            )}
            <Button title="Escanear de nuevo" onPress={reiniciar} />
          </>
        ) : (
          permiso?.granted && <Aviso texto="Apuntá la cámara a un QR o código de barras." />
        )}
      </Seccion>

      <Seccion titulo="Generar un QR">
        <Input label="Texto o enlace" value={texto} onChangeText={setTexto} />
        <View style={styles.qr}>
          <QRCode value={texto.trim() || " "} size={200} color="#000000" backgroundColor="#FFFFFF" />
        </View>
      </Seccion>
    </PantallaHerramienta>
  );
}

const styles = StyleSheet.create({
  preview: { width: "100%", aspectRatio: 1, maxHeight: 360, borderRadius: 16, overflow: "hidden" },
  camara: { flex: 1 },
  // Marco blanco fijo: los lectores necesitan fondo claro, también en modo oscuro
  qr: { alignSelf: "center", backgroundColor: "#FFFFFF", padding: 16, borderRadius: 12 },
});