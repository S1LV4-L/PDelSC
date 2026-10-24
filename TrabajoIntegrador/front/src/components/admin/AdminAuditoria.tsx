import { useEffect, useState } from "react";
import { ActivityIndicator } from "react-native";
import { useAuth } from "../../hooks/useAuth";
import { auditoriaAccesos, auditoriaEventos } from "../../services/adminService";
import Chips from "../ui/Chips";
import FilaItem from "../ui/FilaItem";
import Tarjeta from "../ui/Tarjeta";
import Texto from "../ui/Texto";

type Vista = "accesos" | "fallidos" | "qr" | "correcciones" | "todo";

const VISTAS = [
  { valor: "accesos" as Vista, label: "Accesos" },
  { valor: "fallidos" as Vista, label: "Login fallidos" },
  { valor: "qr" as Vista, label: "QR regenerados" },
  { valor: "correcciones" as Vista, label: "Correcciones" },
  { valor: "todo" as Vista, label: "Todos los eventos" },
];

type Fila = { id: number; titulo: string; subtitulo: string; color?: string };

const detalleTexto = (d: Record<string, unknown> | null) =>
  d ? Object.entries(d).filter(([, v]) => v !== null && v !== "").map(([k, v]) => `${k}: ${String(v)}`).join(" · ") : "";

const NOMBRE_ACCION: Record<string, string> = {
  qr_regenerado: "QR regenerado",
  asistencia_manual: "Asistencia corregida",
  justificacion: "Justificación",
  comunicado: "Comunicado enviado",
  importacion: "Importación de alumnos",
  promocion: "Cambio de ciclo",
};

export default function AdminAuditoria() {
  const { token } = useAuth();
  const [vista, setVista] = useState<Vista>("accesos");
  const [filas, setFilas] = useState<Fila[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  
  useEffect(() => {
    if (!token) return;
    setCargando(true);
    
    const cargar = async (): Promise<Fila[]> => {
      if (vista === "accesos" || vista === "fallidos") {
        const l = await auditoriaAccesos(token, vista === "fallidos" ? "fallido" : undefined);
        return l.map((a) => ({
          id: a.id,
          titulo: a.nombre ?? "Usuario eliminado",
          subtitulo: `${a.fecha}${a.email ? ` · ${a.email}` : ""} · ${a.resultado}`,
          color: a.resultado === "fallido" ? "error" : undefined,
        }));
      }
      
      const accion = vista === "qr" ? "qr_regenerado" : vista === "correcciones" ? "asistencia_manual" : undefined;
      const l = await auditoriaEventos(token, accion);
      
      return l.map((e) => ({
        id: e.id,
        titulo: `${NOMBRE_ACCION[e.accion] ?? e.accion} · ${e.usuario ?? "—"}`,
        subtitulo: `${e.fecha} · ${detalleTexto(e.detalle)}`,
      }));
    };
    cargar()
      .then((f) => {
        setFilas(f);
        setError("");
      })
      .catch((e) => setError(e instanceof Error ? e.message : "No se pudo cargar la auditoría"))
      .finally(() => setCargando(false));
  }, [token, vista]);
  
  return (
    <Tarjeta>
      <Texto size={20} bold>Auditoría</Texto>
      <Chips opciones={VISTAS} valor={vista} onChange={setVista} />
      {vista === "fallidos" && (
        <Texto size={13} color="muted">Solo se registran intentos fallidos sobre emails que existen.</Texto>
      )}
      {!!error && <Texto size={14} color="error">{error}</Texto>}
      {cargando ? (
        <ActivityIndicator />
      ) : filas.length === 0 ? (
        <Texto color="muted">No hay registros.</Texto>
      ) : (
        filas.map((f) => <FilaItem key={f.id} titulo={f.titulo} subtitulo={f.subtitulo} />)
      )}
    </Tarjeta>
  );
}