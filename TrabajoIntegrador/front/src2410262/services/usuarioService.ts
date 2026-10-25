import { apiPost } from "./api";

export type PerfilItem = { id: number; nombre: string };

export type UsuarioAdmin = {
  id: number;
  nombre: string;
  email: string | null;
  perfil: { id: number | null; nombre: string };
  curso: { id: number; anio: number; division: number } | null;
};

export const listarUsuarios = (token: string) =>
  apiPost<UsuarioAdmin[]>("/api/usuarios/listar", {}, token);

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

export const eliminarUsuario = (token: string, id: number) =>
  apiPost<{ mensaje: string }>("/api/usuarios/eliminar", { id }, token);