// Contexto global de autenticación.
// Permite que cualquier componente sepa quien esta logueado y pueda hacer login/logout sin pasar props manualmente por cada nivel.
import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import api from "../services/api";
import type { Usuario, AuthContextType, RegistroDatos } from "../types";

// Contenedor del Context. Empieza en null hasta que AuthProvider lo inicialice.
const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    // Estado del usuario logueado. Al iniciar, intenta recuperarlo del localStorage
    const [usuario, setUsuario] = useState<Usuario | null>(() => {
        const guardado = localStorage.getItem("usuario");
        return guardado ? JSON.parse(guardado) : null;
    });

    // Envía credenciales al back. Si son correctas guarda el token y los datos del usuario en localStorage y en el estado.
    // Devuelve el usuario para que quien llame a login() pueda decidir a dónde redirigir según su perfil.
    const login = async (nombreUsuario: string, password: string): Promise<Usuario> => {
        const { data } = await api.post("/auth/login", { nombreUsuario, password });
        localStorage.setItem("token", data.token);
        localStorage.setItem("usuario", JSON.stringify(data.usuario));
        setUsuario(data.usuario);
        return data.usuario;
    };

    // Guarda un token ya emitido por el backend (login vía OAuth) y trae el perfil del usuario.
    // Se usa desde AuthCallback.tsx tras volver de Google/GitHub/Facebook.
    const iniciarSesionConToken = async (token: string): Promise<Usuario> => {
        localStorage.setItem("token", token);
        const { data } = await api.post("/usuarios/mi-perfil");
        localStorage.setItem("usuario", JSON.stringify(data));
        setUsuario(data);
        return data;
    };

    // Crea una cuenta nueva. No inicia sesión automáticamente (el usuario debe loguearse después de registrarse)
    const registrar = async ({ nombre, password, preguntaSeguridad, respuestaSeguridad }: RegistroDatos) => {
        await api.post("/auth/registro", {
            nombre,
            password,
            preguntaSeguridad,
            respuestaSeguridad,
        });
    };

    // Cambia la contraseña validando la respuesta de seguridad, sin necesidad de estar logueado (flujo de "olvidé mi contraseña").
    const solicitarRestablecimiento = async (
        nombreUsuario: string,
        respuestaSeguridad: string,
        nuevaPassword: string,
    ) => {
        await api.post("/auth/restablecer", {
            nombreUsuario,
            respuestaSeguridad,
            nuevaPassword,
        });
    };

    // Cierra sesión: limpia todo rastro de la sesión actual.
    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("usuario");
        setUsuario(null);
    };

    return (
        <AuthContext.Provider
            value={{ usuario, login, iniciarSesionConToken, registrar, solicitarRestablecimiento, logout }}
        >
            {children}
        </AuthContext.Provider>
    );
}

// Hook para consumir el Context sin repetir useContext(AuthContext) en cada componente.
export const useAuth = (): AuthContextType => {
    const ctx = useContext(AuthContext); //Extrae el valor actual de 'AuthContext' leyendo hacia arriba en el árbol de componentes.
    if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider"); // Previene fallos comprabando si existe el contexto.
    return ctx;
};