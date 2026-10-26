import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../hooks/useAuth";
import { alumnosDelDictado, marcarManual } from "../../services/asistenciaService";
import { AlumnoDictado } from "../../types/academico";
import QrDictado from "./QrDictado";
import Button from "../ui/Button";
import EstadoTexto from "../ui/EstadoTexto";
import FilaItem from "../ui/FilaItem";
import Tarjeta from "../ui/Tarjeta";
import Texto from "../ui/Texto";

export default function DictadoAsistencia({ dictadoId, titulo }: { dictadoId: number; titulo?: string }) {
  const router = useRouter();
  const { token } = useAuth();
  const [alumnos, setAlumnos] = useState<AlumnoDictado[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [confirmando, setConfirmando] = useState<number | null>(null);
  const [marcando, setMarcando] = useState<number | null>(null);
  
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
  
  const marcar = async (alumnoId: number) => {
    if (!token) return;
    try {
      setMarcando(alumnoId);
      setError("");
      await marcarManual(token, dictadoId, alumnoId);
      setConfirmando(null);
      await cargar();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo marcar la asistencia");
    } finally {
      setMarcando(null);
    }
  };
  
  const hayQr = alumnos.some((a) => a.estado !== null);
  const presentes = alumnos.filter((a) => a.estado === "presente").length;
  
  return (
    <>
      <Tarjeta>
        <QrDictado dictadoId={dictadoId} onCambio={cargar} />
      </Tarjeta>
      <Tarjeta>
        <Texto size={18} bold>Alumnos</Texto>
        <Texto size={14} color="muted">
          {hayQr ? `Presentes hoy: ${presentes} de ${alumnos.length}` : `${alumnos.length} inscriptos · todavía no hay QR hoy`}
        </Texto>
        {!!error && <Texto size={14} color="error">{error}</Texto>}
        {cargando ? (
          <ActivityIndicator />
        ) : alumnos.length === 0 ? (
          <Texto color="muted">No hay alumnos inscriptos.</Texto>
        ) : (
          alumnos.map((a) => (
            <FilaItem
              key={a.alumno_id}
              titulo={a.nombre}
              subtitulo={confirmando === a.alumno_id ? "¿Marcar presente a mano?" : undefined}
              derecha={
                confirmando === a.alumno_id ? (
                  <View style={styles.acciones}>
                    <Button style={styles.chico} title="Sí, presente" loading={marcando === a.alumno_id} onPress={() => marcar(a.alumno_id)} />
                    <Button variant="link" title="No" onPress={() => setConfirmando(null)} />
                  </View>
                ) : (
                  <View style={styles.acciones}>
                    <EstadoTexto estado={a.estado} />
                    {a.estado === "ausente" && (
                      <Button style={styles.chico} variant="outline" title="Marcar presente" onPress={() => setConfirmando(a.alumno_id)} />
                    )}
                  </View>
                )
              }
              onPress={() =>
                router.push({
                  pathname: "./dictado-alumno",
                  params: { dictadoId: String(dictadoId), alumnoId: String(a.alumno_id), titulo },
                })
              }
            />
          ))
        )}
      </Tarjeta>
    </>
  );
}

const styles = StyleSheet.create({
  acciones: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" },
  chico: { paddingVertical: 8, paddingHorizontal: 10 },
});