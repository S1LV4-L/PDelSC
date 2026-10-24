import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Pantalla from "../../components/Pantalla";
import QrDictado from "../../components/QrDictado";
import EstadoTexto from "../../components/ui/EstadoTexto";
import FilaItem from "../../components/ui/FilaItem";
import Tarjeta from "../../components/ui/Tarjeta";
import { useTheme } from "../../constants/theme";
import { useAuth } from "../../hooks/useAuth";
import { useResponsive } from "../../hooks/useResponsive";
import { alumnosDelDictado } from "../../services/asistenciaService";
import { AlumnoDictado } from "../../types/academico";

export default function DictadoScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { fs } = useResponsive();
  const { token } = useAuth();
  const { id, titulo } = useLocalSearchParams<{ id: string; titulo?: string }>();
  const dictadoId = Number(id);

  const [alumnos, setAlumnos] = useState<AlumnoDictado[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const cargar = useCallback(async () => {
    if (!token) return;
    try {
      setAlumnos(await alumnosDelDictado(token, dictadoId));
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo cargar la lista de alumnos");
    } finally {
      setCargando(false);
    }
  }, [token, dictadoId]);

  // Se refresca solo para ver quién va escaneando el QR
  useEffect(() => {
    cargar();
    const t = setInterval(cargar, 5000);
    return () => clearInterval(t);
  }, [cargar]);

  const hayQr = alumnos.some((a) => a.estado !== null);
  const presentes = alumnos.filter((a) => a.estado === "presente").length;

  return (
    <Pantalla volver>
      <Text style={[styles.titulo, { color: theme.text, fontSize: fs(24) }]}>{titulo}</Text>

      <Tarjeta>
        <QrDictado dictadoId={dictadoId} onCambio={cargar} />
      </Tarjeta>

      <Tarjeta>
        <Text style={[styles.subtitulo, { color: theme.text, fontSize: fs(18) }]}>Alumnos</Text>
        <Text style={{ color: theme.muted, fontSize: fs(14) }}>
          {hayQr
            ? `Presentes hoy: ${presentes} de ${alumnos.length}`
            : `${alumnos.length} inscriptos · todavía no hay QR hoy`}
        </Text>

        {!!error && <Text style={{ color: theme.error, fontSize: fs(14) }}>{error}</Text>}

        {cargando ? (
          <ActivityIndicator />
        ) : alumnos.length === 0 ? (
          <Text style={{ color: theme.muted, fontSize: fs(15) }}>No hay alumnos inscriptos.</Text>
        ) : (
          alumnos.map((a) => (
            <FilaItem
              key={a.alumno_id}
              titulo={a.nombre}
              derecha={<EstadoTexto estado={a.estado} />}
              onPress={() =>
                router.push({
                  pathname: "./dictado-alumno",
                  params: {
                    dictadoId: String(dictadoId),
                    alumnoId: String(a.alumno_id),
                    titulo,
                  },
                })
              }
            />
          ))
        )}
      </Tarjeta>
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  titulo: { fontWeight: "800", letterSpacing: -0.3 },
  subtitulo: { fontWeight: "800", letterSpacing: -0.3 },
});