// Página para restablecer la contraseña usando la pregunta de seguridad
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { validarNombre, validarRespuestaSeguridad, validarPassword } from "../utils/validaciones";
import type { OlvidePasswordFormDatos } from "../types";
import "../styles/OlvidePassword.css";
import { ThemeToggle } from "../components/BotonTema";

export default function OlvidePassword() {
    const [error, setError] = useState("");
    const [exito, setExito] = useState(false);
    const { solicitarRestablecimiento } = useAuth();
    const navigate = useNavigate();
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<OlvidePasswordFormDatos>();

    const onSubmit = async (datos: OlvidePasswordFormDatos) => {
        try {
            await solicitarRestablecimiento(datos.nombreUsuario, datos.respuestaSeguridad, datos.nuevaPassword);
            setExito(true);
            setTimeout(() => navigate("/login"), 1500);
        } catch {
            setError("No se pudo restablecer la contraseña");
        }
    };

    if (exito) return <p className="mensaje-exito">Contraseña actualizada. Redirigiendo al login...</p>;

    return (
        <div>
            <ThemeToggle />
            <form className="olvide-page" onSubmit={handleSubmit(onSubmit)}>
                <h1>Restablecer contraseña</h1>
                {error && <p className="error">{error}</p>}

                <label htmlFor="olvidepassword-usuario">Nombre de usuario</label>
                <input
                    id="olvidepassword-usuario"
                    placeholder="Ingrese su nombre de usuario"
                    {...register("nombreUsuario", { validate: validarNombre })}
                />
                {errors.nombreUsuario && <p className="error">{errors.nombreUsuario.message}</p>}

                <label htmlFor="olvidepassword-respuesta">Respuesta a tu pregunta de seguridad</label>
                <input
                    id="olvidepassword-respuesta"
                    placeholder="Ingrese la respuesta"
                    {...register("respuestaSeguridad", { validate: validarRespuestaSeguridad })}
                />
                {errors.respuestaSeguridad && <p className="error">{errors.respuestaSeguridad.message}</p>}

                <label htmlFor="olvidepassword-passwd">Nueva contraseña</label>
                <input
                    id="passwd"
                    type="password"
                    placeholder="Ingrese su nueva contraseña"
                    {...register("nuevaPassword", { validate: validarPassword })}
                />
                {errors.nuevaPassword && <p className="error">{errors.nuevaPassword.message}</p>}

                <div className="olvide-acciones">
                    <button type="submit">Restablecer</button>
                    <Link className="btn-link" to="/login">
                        Volver
                    </Link>
                </div>
            </form>
        </div>
    );
}
