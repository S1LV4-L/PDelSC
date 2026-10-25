import { apiPost } from "./api";
import { Comunicado, ComunicadoEnviado } from "../types/academico";
export const enviarComunicado = (
  token: string,
  datos: {
    titulo: string;
    mensaje: string;
    alcance: "global" | "curso" | "usuario";
    cursoIds?: number[];
    usuarioIds?: number[];
  }
) => apiPost<{ id: number }>("/api/comunicados/enviar", datos, token);
export const comunicadosEnviados = (token: string) =>
  apiPost<ComunicadoEnviado[]>("/api/comunicados/enviados", {}, token);
export const eliminarComunicado = (token: string, id: number) =>
  apiPost<{ ok: boolean }>("/api/comunicados/eliminar", { id }, token);
export const comunicadosMios = (token: string) => apiPost<Comunicado[]>("/api/comunicados/mios", {}, token);
export const marcarLeido = (token: string, id: number) =>
  apiPost<{ ok: boolean }>("/api/comunicados/leer", { id }, token);