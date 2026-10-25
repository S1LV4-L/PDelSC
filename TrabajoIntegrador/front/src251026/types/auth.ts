export type Perfil = { id: number; nombre: string };
export type Session = { token: string; usuario: Usuario };
export type Usuario = {
  id: number;
  nombre: string;
  email: string | null;
  tienePassword?: boolean;
  permisos?: string[];
  perfil: Perfil;
};