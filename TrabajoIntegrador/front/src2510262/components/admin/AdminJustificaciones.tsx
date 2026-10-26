import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Image, StyleSheet, View } from "react-native";
import { useTheme } from "../../constants/theme";
import { useAuth } from "../../hooks/useAuth";
import {
  adjuntoJustificacion,
  justificacionesPorEstado,
  resolverJustificacion,
} from "../../services/justificacionService";
import { EstadoJustificacion, Justificacion } from "../../types/academico";
import { dictadoLabel, fechaLarga } from "../../utils/formato";
import Button from "../ui/Button";
import Chips from "../ui/Chips";
import Input from "../ui/Input";
import Tarjeta from "../ui/Tarjeta";
import Texto from "../ui/Texto";

const ESTADOS = [
  { valor: "pendiente" as EstadoJustificacion, label: "Pendientes" },
  { valor: "aprobada" as EstadoJustificacion, label: "Aprobadas" },
  { valor: "rechazada" as EstadoJustificacion, label: "Rechazadas" },
];

export default function AdminJustificaciones() {
  const theme = useTheme();
  const { token } = useAuth();
  const [estado, setEstado] = useState<EstadoJustificacion>("pendiente");
  const [lista, setLista] = useState<Justificacion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [imagenes, setImagenes] = useState<Record<number, string>>({});
  const [resolviendo, setResolviendo] = useState<{ id: number; aprobar: boolean } | null>(null);
  const [respuesta, setRespuesta] = useState("");
  const [guardando, setGuardando] = useState(false);
  
  const cargar = useCallback(async () => {
    if (!token) return;
    try {
      setCargando(true);
      setLista(await justificacionesPorEstado(token, estado));
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudieron cargar los pedidos");
    } finally {
      setCargando(false);
    }
  }, [token, estado]);
  
  useEffect(() => {
    cargar();
  }, [cargar]);
  
  const verImagen = async (id: number) => {
    if (!token) return;
    try {
      const r = await adjuntoJustificacion(token, id);
      setImagenes((prev) => ({ ...prev, [id]: `data:${r.mime};base64,${r.base64}` }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo cargar la imagen");
    }
  };
  
  const resolver = async () => {
    if (!token || !resolviendo) return;
    try {
      setGuardando(true);
      await resolverJustificacion(token, resolviendo.id, resolviendo.aprobar, respuesta);
      setResolviendo(null);
      setRespuesta("");
      await cargar();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo resolver el pedido");
    } finally {
      setGuardando(false);
    }
  };
  
  return (
    <Tarjeta>
      <Texto size={20} bold>Pedidos de justificación</Texto>
      <Chips opciones={ESTADOS} valor={estado} onChange={setEstado} />
      {!!error && <Texto size={14} color="error">{error}</Texto>}
      {cargando ? (
        <ActivityIndicator />
      ) : lista.length === 0 ? (
        <Texto color="muted">No hay pedidos en este estado.</Texto>
      ) : (
        lista.map((j) => (
          <View key={j.id} style={[styles.fila, { borderColor: theme.border }]}>
            <Texto bold>{j.alumno}</Texto>
            <Texto size={14} color="muted">{dictadoLabel(j)} · {fechaLarga(j.fecha)}</Texto>
            <Texto>{j.motivo}</Texto>
            {!!j.respuesta && <Texto size={14} color="muted">Respuesta: {j.respuesta}</Texto>}
            {j.tiene_adjunto && !imagenes[j.id] && (
              <Button variant="outline" title="Ver certificado" onPress={() => verImagen(j.id)} />
            )}
            {!!imagenes[j.id] && (
              <Image source={{ uri: imagenes[j.id] }} style={styles.imagen} resizeMode="contain" />
            )}
            {j.estado === "pendiente" && resolviendo?.id !== j.id && (
              <View style={styles.acciones}>
                <Button title="Aprobar" style={styles.chico} onPress={() => setResolviendo({ id: j.id, aprobar: true })} />
                <Button variant="outline" title="Rechazar" style={styles.chico} onPress={() => setResolviendo({ id: j.id, aprobar: false })} />
              </View>
            )}
            {resolviendo?.id === j.id && (
              <View style={{ gap: 8 }}>
                <Input label={resolviendo.aprobar ? "Comentario (opcional)" : "Motivo del rechazo (opcional)"}
                  value={respuesta} onChangeText={setRespuesta} maxLength={255} autoCapitalize="sentences" />
                <Button title={resolviendo.aprobar ? "Confirmar aprobación" : "Confirmar rechazo"} onPress={resolver} loading={guardando} />
                <Button variant="link" title="Cancelar" onPress={() => setResolviendo(null)} />
              </View>
            )}
          </View>
        ))
      )}
    </Tarjeta>
  );
}

const styles = StyleSheet.create({
  fila: { borderWidth: 1, borderRadius: 12, padding: 14, gap: 8 },
  imagen: { width: "100%", height: 320, borderRadius: 8 },
  acciones: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  chico: { paddingVertical: 10, paddingHorizontal: 16 },
});