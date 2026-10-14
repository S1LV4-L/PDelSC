import { useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Accelerometer, Gyroscope, Magnetometer } from "expo-sensors";
import PantallaHerramienta, { Dato, Seccion } from "../../components/PantallaHerramienta";
import Button from "../../components/ui/Button";
import { useTheme } from "../../constants/theme";

type Vec = { x: number; y: number; z: number };
type Sensor = {
  setUpdateInterval: (ms: number) => void;
  addListener: (listener: (datos: Vec) => void) => { remove: () => void };
};

/** Hook personalizado para suscribirse a un sensor de movimiento y obtener sus datos (x, y, z) */
function useSensor(sensor: Sensor, activo: boolean) {
  const [datos, setDatos] = useState<Vec>({ x: 0, y: 0, z: 0 });

  useEffect(() => {
    if (!activo) return;
    sensor.setUpdateInterval(100); // Frecuencia de muestreo
    const suscripcion = sensor.addListener(setDatos);
    return () => suscripcion.remove(); // Limpieza al desmontar o desactivar
  }, [sensor, activo]);

  return datos;
}

// Panel específico para el Acelerómetro. Detecta sacudidas y muestra una burbuja visual de movimiento
function PanelAcelerometro() {
  const theme = useTheme();
  const [activo, setActivo] = useState(false);
  const [sacudidas, setSacudidas] = useState(0); // Contador de sacudidas
  const ultima = useRef(0); // Timestamp de la última sacudida (debounce)
  const datos = useSensor(Accelerometer, activo);

  // Una sacudida es una aceleración total mayor a ~2 g, con 600 ms entre una y otra
  useEffect(() => {
    const fuerza = Math.sqrt(datos.x ** 2 + datos.y ** 2 + datos.z ** 2);
    if (activo && fuerza > 2.2 && Date.now() - ultima.current > 600) {
      ultima.current = Date.now();
      setSacudidas((n) => n + 1);
    }
  }, [datos, activo]);

  // Cálculos para mover la burbuja visual dentro de la caja
  const TAM = 220;
  const RADIO = 16;
  const limite = TAM / 2 - RADIO;
  const bx = Math.max(-limite, Math.min(limite, -datos.x * limite));
  const by = Math.max(-limite, Math.min(limite, datos.y * limite));

  return (
    <Seccion titulo="Acelerómetro">
      <Dato etiqueta="X (g)" valor={datos.x.toFixed(3)} />
      <Dato etiqueta="Y (g)" valor={datos.y.toFixed(3)} />
      <Dato etiqueta="Z (g)" valor={datos.z.toFixed(3)} />
      <Dato etiqueta="Sacudidas detectadas" valor={String(sacudidas)} />

      {/* inclinación del dispositivo */}
      <View style={[styles.caja, { width: TAM, height: TAM, borderColor: theme.border }]}>
        <View
          style={{
            position: "absolute",
            left: TAM / 2 - RADIO + bx,
            top: TAM / 2 - RADIO + by,
            width: RADIO * 2,
            height: RADIO * 2,
            borderRadius: RADIO,
            backgroundColor: theme.primary,
          }}
        />
      </View>

      <Button variant="outline" title={activo ? "Detener" : "Iniciar"} onPress={() => setActivo((a) => !a)} />
      <Button variant="link" title="Reiniciar contador" onPress={() => setSacudidas(0)} />
    </Seccion>
  );
}

/** Giroscopio y Magnetómetro */
function PanelSensor({ nombre, sensor, unidad }: { nombre: string; sensor: Sensor; unidad: string }) {
  const [activo, setActivo] = useState(false);
  const datos = useSensor(sensor, activo);

  return (
    <Seccion titulo={nombre}>
      <Dato etiqueta={`X (${unidad})`} valor={datos.x.toFixed(3)} />
      <Dato etiqueta={`Y (${unidad})`} valor={datos.y.toFixed(3)} />
      <Dato etiqueta={`Z (${unidad})`} valor={datos.z.toFixed(3)} />
      <Button variant="outline" title={activo ? "Detener" : "Iniciar"} onPress={() => setActivo((a) => !a)} />
    </Seccion>
  );
}

// Pantalla que agrupa los paneles de los sensores de movimiento del dispositivo
export default function SensoresScreen() {
  return (
    <PantallaHerramienta titulo="Sensores de movimiento">
      <PanelAcelerometro />
      <PanelSensor nombre="Giroscopio" sensor={Gyroscope} unidad="rad/s" />
      <PanelSensor nombre="Magnetómetro" sensor={Magnetometer} unidad="µT" />
    </PantallaHerramienta>
  );
}

const styles = StyleSheet.create({
  caja: { alignSelf: "center", borderWidth: 2, borderRadius: 16, overflow: "hidden" },
});