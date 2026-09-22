import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useTareas } from "../hooks/useTareas";
import "../styles/Details.css";
import { ThemeToggle } from "../components/BotonTema";

interface FormValues {
    titulo: string;
    descripcion: string;
}

// Página de detalle: muestra la información completa de una tarea según el id de la URL
function Details() {
    const { id } = useParams();
    const { obtenerTareaPorId, setTareas } = useTareas();
    const tarea = obtenerTareaPorId(id!);
    const [editando, setEditando] = useState(false);

    const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
        defaultValues: {
            titulo: tarea?.titulo ?? "",
            descripcion: tarea?.descripcion ?? ""
        }
    });

    // Si la id es inexistente o la tarea fue tarea eliminada
    if (!tarea) {
        return (
            <>
                <ThemeToggle />
                <div className="page details-page">
                    <div className="page-inner">
                        <p className="nombrePag">DETALLES</p>
                        <div className="details-empty">Tarea no encontrada</div>
                    </div>
                </div>
            </>
        );
    }

    const iniciarEdicion = () => {
        reset({ titulo: tarea.titulo, descripcion: tarea.descripcion });
        setEditando(true);
    };

    const cancelarEdicion = () => {
        reset({ titulo: tarea.titulo, descripcion: tarea.descripcion });
        setEditando(false);
    };

    const guardarEdicion = (datos: FormValues) => {
        setTareas((prev) =>
            prev.map((t) =>
                t.id === tarea.id
                    ? { ...t, titulo: datos.titulo.trim(), descripcion: datos.descripcion.trim() }
                    : t
            )
        );
        setEditando(false);
    };

    return (
        <>
            <ThemeToggle />
            <div className="page details-page">
                <div className="page-inner">
                    <p className="nombrePag">DETALLES</p>

                    <div className="details-card">
                        <header className="details-header">
                            <div className="headerPag">
                                {editando ? (
                                    <h1 className="details-title">Editar tarea</h1>
                                ) : (
                                    <h1 className="details-title">{tarea.titulo}</h1>
                                )}
                                <Link to="/" className="volver btn btn-ghost">
                                    Volver
                                </Link>
                            </div>
                        </header>

                        {!editando && (
                            <div className="details-info-row">
                                <span className={`status-pill ${tarea.completa ? "status-pill--complete" : "status-pill--pending"}`}>
                                    {tarea.completa ? "Completa" : "Pendiente"}
                                </span>
                                <span className="details-meta">
                                    {new Date(tarea.fechaCreacion).toLocaleDateString()}
                                </span>
                            </div>
                        )}

                        {editando ? (
                            <form className="details-form" onSubmit={handleSubmit(guardarEdicion)}>
                                <label className="details-label" htmlFor="titulo">
                                    Título
                                </label>
                                <input
                                    id="titulo"
                                    className="details-input"
                                    {...register("titulo", {
                                        required: "El título es obligatorio",
                                        validate: (v) => v.trim().length > 0 || "El título es obligatorio"
                                    })}
                                />
                                {errors.titulo && <p className="details-error">{errors.titulo.message}</p>}

                                <label className="details-label" htmlFor="descripcion">
                                    Descripción
                                </label>
                                <textarea
                                    id="descripcion"
                                    className="details-textarea"
                                    rows={4}
                                    {...register("descripcion")}
                                />

                                <div className="details-form-actions">
                                    <button type="submit" className="btn btn-ghost details-btn--guardar">
                                        Guardar
                                    </button>
                                    <button type="button" className="btn btn-ghost" onClick={cancelarEdicion}>
                                        Cancelar
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <>
                                <p className="details-desc">{tarea.descripcion}</p>
                                <div className="details-form-actions">
                                    <button type="button" className="btn btn-ghost details-btn--editar" onClick={iniciarEdicion}>
                                        Editar
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

export default Details;