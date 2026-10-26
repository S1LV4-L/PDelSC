import { Tabla } from "../types/academico";
import { apiPost } from "./api";

export type PerfilItem = { id: number; nombre: string };

export type UsuarioAdmin = {
  id: number;
  nombre: string;
  email: string | null;
  ocultoEn: string | null;
  perfil: { id: number | null; nombre: string };
  curso: { id: number; anio: number; division: number } | null;
};

// ocultos = true devuelve solo los usuarios ocultos; por defecto, solo los activos
export const listarUsuarios = (token: string, ocultos = false) =>
  apiPost<UsuarioAdmin[]>("/api/usuarios/listar", { ocultos }, token);

export const listarPerfiles = (token: string) =>
  apiPost<PerfilItem[]>("/api/perfiles/listar", {}, token);

export const crearUsuario = (
  token: string,
  datos: { nombre: string; email: string; password: string; perfilId: number }
) =>
  apiPost<{ mensaje: string; id: number; codigosRecuperacion: string[] }>(
    "/api/usuarios/crear",
    datos,
    token
  );

  export const actualizarUsuario = (
  token: string,
  datos: { id: number; nombre: string; email: string; perfilId: number }
) => apiPost<{ mensaje: string }>("/api/usuarios/actualizar", datos, token);

export const ocultarUsuarios = (token: string, ids: number[]) =>
  apiPost<{ mensaje: string; cantidad: number }>("/api/usuarios/ocultar", { ids }, token);

export const reincorporarUsuarios = (token: string, ids: number[]) =>
  apiPost<{ mensaje: string; cantidad: number }>("/api/usuarios/reincorporar", { ids }, token);

// Solo funciona con usuarios ocultos
export const eliminarUsuario = (token: string, id: number) =>
  apiPost<{ mensaje: string }>("/api/usuarios/eliminar", { id, confirmado: true }, token);

export const exportarUsuarios = (token: string, ids: number[]) =>
  apiPost<Tabla>("/api/usuarios/exportar", { ids }, token);