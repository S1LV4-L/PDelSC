import { useCallback, useEffect, useState } from "react";
import * as Battery from "expo-battery";
import * as Device from "expo-device";
import * as Haptics from "expo-haptics";
import * as Network from "expo-network";
import * as Speech from "expo-speech";
import PantallaHerramienta, { Dato, Seccion } from "../../components/PantallaHerramienta";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

const ESTADOS_BATERIA = ["Desconocido", "Sin cargar", "Cargando", "Completa"];

export default function ExtrasScreen() {
  const [bateria, setBateria] = useState("-");
  const [red, setRed] = useState("-");
  const [ip, setIp] = useState("-");
  const [texto, setTexto] = useState("Hola, esto es una prueba de voz");

  const actualizar = useCallback(async () => {
    const nivel = await Battery.getBatteryLevelAsync();
    const estado = await Battery.getBatteryStateAsync();
    setBateria(nivel < 0 ? "No disponible" : `${Math.round(nivel * 100)}% (${ESTADOS_BATERIA[estado]})`);

    const estadoRed = await Network.getNetworkStateAsync();
    setRed(`${estadoRed.type ?? "?"} - ${estadoRed.isConnected ? "conectado" : "sin conexión"}`);
    setIp(await Network.getIpAddressAsync().catch(() => "-"));
  }, []);

  useEffect(() => {
    actualizar();
  }, [actualizar]);

  return (
    <PantallaHerramienta titulo="Háptica, batería, red y voz">
      <Seccion titulo="Háptica (vibración)">
        <Button variant="outline" title="Leve" onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)} />
        <Button variant="outline" title="Media" onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)} />
        <Button variant="outline" title="Fuerte" onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)} />
        <Button
          variant="outline"
          title="Notificación de éxito"
          onPress={() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)}
        />
        <Button
          variant="outline"
          title="Notificación de error"
          onPress={() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)}
        />
      </Seccion>

      <Seccion titulo="Batería y red">
        <Dato etiqueta="Batería" valor={bateria} />
        <Dato etiqueta="Conexión" valor={red} />
        <Dato etiqueta="Dirección IP" valor={ip} />
        <Button variant="outline" title="Actualizar" onPress={actualizar} />
      </Seccion>

      <Seccion titulo="Dispositivo">
        <Dato etiqueta="Marca" valor={Device.brand ?? "-"} />
        <Dato etiqueta="Modelo" valor={Device.modelName ?? "-"} />
        <Dato etiqueta="Sistema" valor={`${Device.osName ?? "-"} ${Device.osVersion ?? ""}`} />
        <Dato
          etiqueta="Memoria RAM"
          valor={Device.totalMemory ? `${(Device.totalMemory / 1024 ** 3).toFixed(1)} GB` : "-"}
        />
      </Seccion>

      <Seccion titulo="Voz (texto a voz)">
        <Input label="Texto a leer" value={texto} onChangeText={setTexto} />
        <Button title="Hablar" onPress={() => Speech.speak(texto, { language: "es-AR" })} />
        <Button variant="outline" title="Detener" onPress={() => Speech.stop()} />
      </Seccion>
    </PantallaHerramienta>
  );
}