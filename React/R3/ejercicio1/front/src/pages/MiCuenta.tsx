// Página protegida (cualquier usuario logueado, sin requerir permiso de admin).
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import {
    validarNombre,
    validarPreguntaSeguridad,
    validarPassword,
    validarRespuestaSeguridad,
    validarPasswordOpcional,
    validarRespuestaSeguridadOpcional,
} from "../utils/validaciones";
import type { MiCuentaFormDatos, EliminarCuentaFormDatos } from "../types";
import "../styles/MiCuenta.css";
import { ThemeToggle } from "../components/BotonTema";

export default function MiCuenta() {
    const [error, setError] = useState("");
    const [exito, setExito] = useState(false);
    const [errorEliminar, setErrorEliminar] = useState("");
    const { logout } = useAuth();
    const navigate = useNavigate();

    const { register, handleSubmit, watch, reset, formState: { errors }} = useForm<MiCuentaFormDatos>();
    const {
        register: registerEliminar,
        handleSubmit: handleSubmitEliminar,
        watch: watchEliminar,
        formState: { errors: errorsEliminar },
    } = useForm<EliminarCuentaFormDatos>();

    const password = watch("password");
    const passwordEliminar = watchEliminar("password");

    useEffect(() => {
        api.post("/usuarios/mi-perfil").then(({ data }) => {
            reset({ nombre: data.nombre, preguntaSeguridad: data.preguntaSeguridad ?? "" });
        });
    }, [reset]);

    const onSubmit = async (datos: MiCuentaFormDatos) => {
        setError("");
        setExito(false);
        try {
            await api.post("/usuarios/mi-cuenta", {
                nombre: datos.nombre || undefined,
                password: datos.password || undefined,
                preguntaSeguridad: datos.preguntaSeguridad || undefined,
                respuestaSeguridad: datos.respuestaSeguridad || undefined,
            });
            setExito(true);
        } catch {
            setError("No se pudo actualizar la cuenta");
        }
    };

    const onSubmitEliminar = async (datos: EliminarCuentaFormDatos) => {
        setErrorEliminar("");
        try {
            await api.post("/usuarios/eliminar-mi-cuenta", {
                nombre: datos.nombre,
                password: datos.password,
                preguntaSeguridad: datos.preguntaSeguridad,
                respuestaSeguridad: datos.respuestaSeguridad,
            });
            logout();
            navigate("/");
        } catch {
            setErrorEliminar("Los datos ingresados no coinciden con tu cuenta");
        }
    };

    return (
        <div>
            <ThemeToggle/>
            <div className="mi-cuenta-page">
                <div className="cuenta-formularios">
                    {/* Formulario de Edición */}
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <h1>Mi cuenta</h1>
                        {error && <p className="error">{error}</p>}
                        {exito && <p className="mensaje-exito-interno">Cuenta actualizada correctamente</p>}

                        <label htmlFor="micuenta-nombre">Nombre de usuario</label>
                        <input id="micuenta-nombre" placeholder="Nombre" {...register("nombre", { validate: validarNombre })} />
                        {errors.nombre && <p className="error">{errors.nombre.message}</p>}

                        <label htmlFor="micuenta-pass">Nueva contraseña (opcional)</label>
                        <input id="micuenta-pass" type="password" placeholder="Nueva contraseña" {...register("password", { validate: validarPasswordOpcional })} />
                        {errors.password && <p className="error">{errors.password.message}</p>}

                        <input type="password" placeholder="Confirmar contraseña" {...register("confirmarPassword", {
                            validate: (valor) => !password || valor === password || "Las contraseñas no coinciden",
                        })} />
                        {errors.confirmarPassword && <p className="error">{errors.confirmarPassword.message}</p>}

                        <label htmlFor="micuenta-pregunta">Pregunta de seguridad</label>
                        <input id="micuenta-pregunta" placeholder="Pregunta de seguridad" {...register("preguntaSeguridad", { validate: validarPreguntaSeguridad })} />
                        {errors.preguntaSeguridad && <p className="error">{errors.preguntaSeguridad.message}</p>}

                        <label htmlFor="micuenta-respuesta">Respuesta de seguridad (opcional)</label>
                        <input id="micuenta-respuesta" placeholder="Respuesta" {...register("respuestaSeguridad", { validate: validarRespuestaSeguridadOpcional })} />
                        {errors.respuestaSeguridad && <p className="error">{errors.respuestaSeguridad.message}</p>}

                        <div className="cuenta-acciones">
                            <button type="submit">Guardar cambios</button>
                            <Link className="btn-link" to="/">Volver al Home</Link>
                        </div>
                    </form>

                    {/* Formulario de Eliminación */}
                    <form className="panel-peligro" onSubmit={handleSubmitEliminar(onSubmitEliminar)}>
                        <h2>Eliminar cuenta</h2>
                        <p className="texto-advertencia">Esta acción es permanente.</p>
                        <p className="texto-advertencia2">Reingresá tus datos para confirmar.</p>
                        {errorEliminar && <p className="error">{errorEliminar}</p>}

                        <input placeholder="Nombre de usuario" {...registerEliminar("nombre", { validate: validarNombre })} />
                        {errorsEliminar.nombre && <p className="error">{errorsEliminar.nombre.message}</p>}

                        <input type="password" placeholder="Contraseña" {...registerEliminar("password", { validate: validarPassword })} />
                        {errorsEliminar.password && <p className="error">{errorsEliminar.password.message}</p>}

                        <input type="password" placeholder="Confirmar contraseña" {...registerEliminar("confirmarPassword", {
                            validate: (valor) => valor === passwordEliminar || "Las contraseñas no coinciden",
                        })} />
                        {errorsEliminar.confirmarPassword && <p className="error">{errorsEliminar.confirmarPassword.message}</p>}

                        <input placeholder="Pregunta de seguridad" {...registerEliminar("preguntaSeguridad", { validate: validarPreguntaSeguridad })} />
                        {errorsEliminar.preguntaSeguridad && <p className="error">{errorsEliminar.preguntaSeguridad.message}</p>}

                        <input placeholder="Respuesta de seguridad" {...registerEliminar("respuestaSeguridad", { validate: validarRespuestaSeguridad })} />
                        {errorsEliminar.respuestaSeguridad && <p className="error">{errorsEliminar.respuestaSeguridad.message}</p>}

                        <div className="cuenta-acciones">
                            <button type="submit">Eliminar mi cuenta</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}