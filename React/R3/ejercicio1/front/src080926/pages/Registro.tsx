import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
    validarNombre,
    validarPassword,
    validarPreguntaSeguridad,
    validarRespuestaSeguridad,
} from "../utils/validaciones";
import type { RegistroFormDatos } from "../types";
import "../styles/Registro.css";
import { ThemeToggle } from "../components/BotonTema";

export default function Registro() {
    const [error, setError] = useState("");
    const [exito, setExito] = useState(false);
    const { registrar } = useAuth();
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<RegistroFormDatos>();

    const password = watch("password");

    const onSubmit = async (datos: RegistroFormDatos) => {
        try {
            await registrar(datos);
            setExito(true);
            setTimeout(() => navigate("/login"), 1500);
        } catch {
            setError("No se pudo completar el registro");
        }
    };

    if (exito) return <p className="mensaje-exito">Cuenta creada. Redirigiendo al login...</p>;

    return (
        <div>
            <ThemeToggle />
            <form className="registro-page" onSubmit={handleSubmit(onSubmit)}>
                <h1>Crear cuenta</h1>
                {error && <p className="error">{error}</p>}

                <label htmlFor="nombre">Nombre</label>
                <input id="nombre" placeholder="Nombre" {...register("nombre", { validate: validarNombre })} />
                {errors.nombre && <p className="error">{errors.nombre.message}</p>}

                <label htmlFor="password">Contraseña</label>
                <input
                    id="password"
                    type="password"
                    placeholder="Contraseña"
                    {...register("password", { validate: validarPassword })}
                />
                {errors.password && <p className="error">{errors.password.message}</p>}

                <label htmlFor="confirmarPassword">Confirmar contraseña</label>
                <input
                    id="confirmarPassword"
                    type="password"
                    placeholder="Confirmar contraseña"
                    {...register("confirmarPassword", {
                        validate: {
                            noVacio: (valor) => valor.length > 0 || "Debés confirmar la contraseña",
                            coincide: (valor) => valor === password || "Las contraseñas no coinciden",
                        },
                    })}
                />
                {errors.confirmarPassword && <p className="error">{errors.confirmarPassword.message}</p>}

                <label htmlFor="preguntaSeguridad">Pregunta de seguridad</label>
                <input
                    id="preguntaSeguridad"
                    placeholder="Ej: Nombre de tu mascota?"
                    {...register("preguntaSeguridad", { validate: validarPreguntaSeguridad })}
                />
                {errors.preguntaSeguridad && <p className="error">{errors.preguntaSeguridad.message}</p>}

                <label htmlFor="respuestaSeguridad">Respuesta de seguridad</label>
                <input
                    id="respuestaSeguridad"
                    placeholder="Respuesta"
                    {...register("respuestaSeguridad", { validate: validarRespuestaSeguridad })}
                />
                {errors.respuestaSeguridad && <p className="error">{errors.respuestaSeguridad.message}</p>}

                <div className="registro-acciones">
                    <button type="submit">Registrarme</button>
                    <Link className="btn-link" to="/login">
                        Ya tengo cuenta
                    </Link>
                    <Link className="btn-link" to="/">
                        Volver al Home
                    </Link>
                </div>
            </form>
        </div>
    );
}