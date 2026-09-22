import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AuthCallback() {
    const [params] = useSearchParams();
    const { iniciarSesionConToken } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const token = params.get("token");
        if (!token) {
            navigate("/login");
            return;
        }
        iniciarSesionConToken(token)
            .then((usuario) => {
                navigate(usuario.perfil.nombre === "Administrador" ? "/usuarios" : "/");
            })
            .catch(() => navigate("/login"));
    }, []);

    return <p>Iniciando sesión...</p>;
}