// Página intermedia donde el backend redirige tras el login con OAuth (Google/GitHub/Jira) cuando ya generó el JWT. 
// Solo se llega vía redirect.
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AuthCallback() {
    const [params] = useSearchParams();
    const { iniciarSesionConToken } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        // El backend manda el JWT como query param en la URL de redirect
        const token = params.get("token");
        if (!token) {
            // Sin token significa que el proveedor canceló el login o el backend falló antes de emitirlo
            navigate("/login");
            return;
        }
        // Guarda el token y trae los datos del usuario (equivalente a login por usuario/contraseña)
        iniciarSesionConToken(token)
            .then((usuario) => {
                navigate(usuario.perfil.nombre === "Administrador" ? "/usuarios" : "/");
            })
            .catch(() => navigate("/login")); // token inválido o expirado
    }, []);

    return <p>Iniciando sesión...</p>;
}