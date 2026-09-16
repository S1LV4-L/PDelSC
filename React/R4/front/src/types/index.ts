// interfaces de tipos de datos (verifican que los datos tengan la forma correcta)
export interface Permiso {
    id: number;
    nombre: string;
}

export interface Perfil {
    id: number;
    nombre: string;
    permisos?: Permiso[];
}

export interface Usuario {
    id: number;
    nombre: string;
    perfil: Perfil;
}

// Forma del valor que expone el Context de autenticación
export interface AuthContextType {
    usuario: Usuario | null; /** Usuario actualmente autenticado, o null si no hay una sesión activa. */
    login: (nombreUsuario: string, password: string) => Promise<Usuario>; /** Autentica a un usuario utilizando sus credenciales y devuelve el usuario logueado (para poder redirigir según su perfil). */
    solicitarRestablecimiento: (nombreUsuario: string, respuestaSeguridad: string, nuevaPassword: string) => Promise<void>;
    logout: () => void;
}

// Datos del formulario de alta/edición de usuario
export interface UsuarioFormDatos {
    nombre: string;
    perfilId: number;
}

// Datos del formulario de login
export interface LoginFormDatos {
    nombreUsuario: string;
    password: string;
}

// Datos del formulario de "olvidé mi contraseña"
export interface OlvidePasswordFormDatos {
    nombreUsuario: string;
    respuestaSeguridad: string;
    nuevaPassword: string;
}

// Datos del formulario de "mi cuenta" (edición de los propios datos)
export interface MiCuentaFormDatos {
    nombre: string;
    password: string;
    confirmarPassword: string;
    preguntaSeguridad: string;
    respuestaSeguridad: string;
}

// Datos del formulario de eliminar cuenta propia (exige reingresar todo como confirmación)
export interface EliminarCuentaFormDatos {
    nombre: string;
    password: string;
    confirmarPassword: string;
    preguntaSeguridad: string;
    respuestaSeguridad: string;
}