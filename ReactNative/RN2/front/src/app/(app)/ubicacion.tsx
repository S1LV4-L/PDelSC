import { useEffect, useRef, useState } from "react";
import { Linking } from "react-native";
import * as Location from "expo-location";
import PantallaHerramienta, { Aviso, Dato, Seccion } from "../../components/PantallaHerramienta";
import Button from "../../components/ui/Button";

const PUNTOS = ["N", "NE", "E", "SE", "S", "SO", "O", "NO"];
const cardinal = (grados: number) => PUNTOS[Math.round(grados / 45) % 8];

export default function UbicacionScreen() {
  const [pos, setPos] = useState<Location.LocationObject | null>(null);
  const [direccion, setDireccion] = useState("");
  const [siguiendo, setSiguiendo] = useState(false);
  const [rumbo, setRumbo] = useState<number | null>(null);
  const [error, setError] = useState("");
  const subPos = useRef<Location.LocationSubscription | null>(null);
  const subRumbo = useRef<Location.LocationSubscription | null>(null);

  // Al salir de la pantalla se cortan las suscripciones
  useEffect(
    () => () => {
      subPos.current?.remove();
      subRumbo.current?.remove();
    },
    []
  );

  const pedirPermiso = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") setError("Permiso de ubicación denegado");
    return status === "granted";
  };

  const obtenerActual = async () => {
    try {
      setError("");
      if (!(await pedirPermiso())) return;
      const actual = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setPos(actual);
      const [d] = await Location.reverseGeocodeAsync(actual.coords).catch(() => []);
      setDireccion(d ? [d.street, d.streetNumber, d.city, d.region, d.country].filter(Boolean).join(", ") : "");
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo obtener la ubicación");
    }
  };

  const alternarSeguimiento = async () => {
    if (siguiendo) {
      subPos.current?.remove();
      subPos.current = null;
      setSiguiendo(false);
      return;
    }
    setError("");
    if (!(await pedirPermiso())) return;
    subPos.current = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.High, timeInterval: 1000, distanceInterval: 1 },
      setPos
    );
    setSiguiendo(true);
  };

  const alternarBrujula = async () => {
    if (subRumbo.current) {
      subRumbo.current.remove();
      subRumbo.current = null;
      setRumbo(null);
      return;
    }
    setError("");
    if (!(await pedirPermiso())) return;
    subRumbo.current = await Location.watchHeadingAsync((h) =>
      setRumbo(h.trueHeading >= 0 ? h.trueHeading : h.magHeading)
    );
    setRumbo(0);
  };

  return (
    <PantallaHerramienta titulo="Ubicación, GPS y brújula">
      <Seccion titulo="Posición">
        <Button title="Obtener ubicación actual" onPress={obtenerActual} />
        <Button
          variant="outline"
          title={siguiendo ? "Dejar de seguir" : "Seguir en tiempo real"}
          onPress={alternarSeguimiento}
        />
        {!!error && <Aviso texto={error} error />}

        {pos && (
          <>
            <Dato etiqueta="Latitud" valor={pos.coords.latitude.toFixed(6)} />
            <Dato etiqueta="Longitud" valor={pos.coords.longitude.toFixed(6)} />
            <Dato etiqueta="Precisión" valor={`${pos.coords.accuracy?.toFixed(1) ?? "-"} m`} />
            <Dato etiqueta="Altitud" valor={`${pos.coords.altitude?.toFixed(1) ?? "-"} m`} />
            <Dato
              etiqueta="Velocidad"
              valor={`${pos.coords.speed != null ? (pos.coords.speed * 3.6).toFixed(1) : "-"} km/h`}
            />
            <Dato etiqueta="Hora" valor={new Date(pos.timestamp).toLocaleTimeString("es-AR")} />
            {!!direccion && <Dato etiqueta="Dirección" valor={direccion} />}
            <Button
              variant="outline"
              title="Abrir en Google Maps"
              onPress={() =>
                Linking.openURL(`https://www.google.com/maps?q=${pos.coords.latitude},${pos.coords.longitude}`)
              }
            />
          </>
        )}
      </Seccion>

      <Seccion titulo="Brújula">
        <Button
          variant="outline"
          title={rumbo === null ? "Activar brújula" : "Desactivar brújula"}
          onPress={alternarBrujula}
        />
        {rumbo !== null && (
          <Dato etiqueta="Rumbo" valor={`${rumbo.toFixed(0)}° ${cardinal(rumbo)}`} />
        )}
      </Seccion>
    </PantallaHerramienta>
  );
}