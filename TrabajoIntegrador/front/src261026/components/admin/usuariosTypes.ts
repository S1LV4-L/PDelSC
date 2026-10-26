import { PerfilItem, UsuarioAdmin } from "../../services/usuarioService";

export type Modo =
  | { tipo: "lista" }
  | { tipo: "crear" }
  | { tipo: "editar"; usuario: UsuarioAdmin }
  | { tipo: "codigos"; codigos: string[]; nombre: string; alumnoId?: number }
  | { tipo: "asignar"; id: number; nombre: string };

export type DatosForm = {
  nombre: string;
  email: string;
  password?: string;
  perfilId: number;
};

export type FormProps = {
  usuario?: UsuarioAdmin;
  perfiles: PerfilItem[];
  bloquearPerfil: boolean;
  loading: boolean;
  error: string;
  onGuardar: (datos: DatosForm) => void;
  onCancelar: () => void;
};