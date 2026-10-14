import { useEffect, useState } from "react";
import * as LocalAuthentication from "expo-local-authentication";
import PantallaHerramienta, { Aviso, Dato, Seccion } from "../../components/PantallaHerramienta";
import Button from "../../components/ui/Button";

// Diccionario para traducir los tipos de autenticación biométrica al español
const TIPOS: Record<number, string> = {
  [LocalAuthentication.AuthenticationType.FINGERPRINT]: "Huella digital",
  [LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION]: "Reconocimiento facial",
  [LocalAuthentication.AuthenticationType.IRIS]: "Iris",
};

// Pantalla que consulta las capacidades biométricas del dispositivo y permite probar la autenticación
export default function BiometriaScreen() {
  // Estado para almacenar la info del hardware, inscripción y tipos de biometría
  const [info, setInfo] = useState({ hardware: false, inscripto: false, tipos: [] as string[] });
  // Estado para el resultado de la prueba de autenticación
  const [resultado, setResultado] = useState("");
  const [exito, setExito] = useState(false);

  useEffect(() => {
    (async () => {
      const hardware = await LocalAuthentication.hasHardwareAsync();
      const inscripto = await LocalAuthentication.isEnrolledAsync();
      const tipos = await LocalAuthentication.supportedAuthenticationTypesAsync();
      setInfo({ hardware, inscripto, tipos: tipos.map((t) => TIPOS[t] ?? `Tipo ${t}`) });
    })();
  }, []);

  const autenticar = async () => {
    setResultado("");
    const r = await LocalAuthentication.authenticateAsync({
      promptMessage: "Confirma tu identidad",
      cancelLabel: "Cancelar",
    });
    setExito(r.success);
    setResultado(r.success ? "Autenticación exitosa" : `No autenticado (${r.error})`);
  };

  return (
    <PantallaHerramienta titulo="Biometría">
      <Seccion titulo="Estado del dispositivo">
        <Dato etiqueta="Hardware biométrico" valor={info.hardware ? "Sí" : "No"} />
        <Dato etiqueta="Biometría registrada" valor={info.inscripto ? "Sí" : "No"} />
        <Dato etiqueta="Métodos" valor={info.tipos.join(", ") || "Ninguno"} />
      </Seccion>

      <Seccion titulo="Probar autenticación">
        <Button title="Autenticar" onPress={autenticar} />
        {!!resultado && <Aviso texto={resultado} error={!exito} />}
      </Seccion>
    </PantallaHerramienta>
  );
}