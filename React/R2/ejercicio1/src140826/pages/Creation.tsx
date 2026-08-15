import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useTareas } from "../hooks/useTareas";
import "../styles/Creation.css";
import { ThemeToggle } from "../components/BotonTema";

interface FormValues {
    titulo: string;
    descripcion: string;
    completa: boolean;
}

// VALIDACIÓN PURAS

const validarTitulo = (value: string): string | boolean => {
    const sinEspacios = value.trim();
    
    // 1. Validar que no esté vacío
    if (!sinEspacios) {
        return "El título no puede estar vacío.";
    }

    // 2. Validar que sean únicamente letras
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(sinEspacios)) {
        return "El título debe contener únicamente letras.";
    }

    // 3. Validar que tenga más de 3 letras (ignorando espacios)
    const soloLetras = sinEspacios.replace(/\s/g, '');
    if (soloLetras.length < 3 || soloLetras.length > 100) {
        return "El título debe tener entre 3 y 100 letras.";
    }

    return true;
};

const validarDescripcion = (value: string): string | boolean => {
    const sinEspacios = value.trim();
    
    // 1. Validar que no esté vacío
    if (!sinEspacios) {
        return "La descripción no puede estar vacía.";
    }

    // 2. Validar formato (solo letras y puntuación)
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s.,;:!?"'-()]+$/.test(sinEspacios)) {
        return "Solo se permiten letras y signos de puntuación.";
    }

    // 3. Validar que no empiece con puntuación
    if (!/[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]/.test(sinEspacios[0])) {
        return "La descripción no puede comenzar con un signo de puntuación.";
    }

    // 4. Validar que no sea solo puntuación
    if (!/[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]/.test(sinEspacios)) {
        return "La descripción no puede contener únicamente signos de puntuación.";
    }

    if(sinEspacios.length <= 3 || sinEspacios.length > 500){
        return "La descripcion debe contener entre 4 y 500 letras"
    }

    return true;
};

// COMPONENTE PRINCIPAL

function Creation() {
    // Configuración de useForm para que solo valide al hacer submit
    const { register, handleSubmit, formState: { errors }, clearErrors } = useForm<FormValues>({
        mode: "onSubmit",
        reValidateMode: "onSubmit"
    });

    const { agregarTarea } = useTareas();
    const navigate = useNavigate();

    // Función si el formulario es válido
    const onSubmit = (data: FormValues) => {
        agregarTarea(data);
        navigate("/");
    };

    // Función si el formulario tiene errores (se dispara al presionar el botón)
    const onError = () => {
        setTimeout(() => {
            clearErrors();
        }, 10000);
    };

    return (
        <>
            <ThemeToggle />
            <div className="page creation-page">
                <div className="page-inner">
                    <p className="nombrePag">Nueva Tarea</p>
                    
                    <div className="creation-card">
                        <header className="creation-header">
                            <div className="headerPag">
                                <h1 className="creation-title">Crear tarea</h1>
                                <button type="button" className="volver btn btn-ghost" onClick={() => navigate(-1)}>
                                    Volver
                                </button>
                            </div>
                        </header>

                        <form className="creation-form" onSubmit={handleSubmit(onSubmit, onError)}>
                            <div className="form-group">
                                <input 
                                    id="titulo" 
                                    className="form-input" 
                                    placeholder="Ingresa el título de la tarea" 
                                    {...register("titulo", { validate: validarTitulo })}
                                />
                                {errors.titulo && <p className="form-error">{errors.titulo.message}</p>}
                            </div>

                            <div className="form-group">
                                <textarea 
                                    id="descripcion" 
                                    className="form-input" 
                                    placeholder="Ingresa la descripción la tarea" 
                                    {...register("descripcion", { validate: validarDescripcion })}
                                />
                                {errors.descripcion && <p className="form-error">{errors.descripcion.message}</p>}
                            </div>

                            <div className="form-checkbox-row">
                                <input id="completa" type="checkbox" {...register("completa")} />
                                <label htmlFor="completa">Marcar como completa</label>
                            </div>

                            <div className="creation-actions">
                                <button type="submit" className="btn btn-primary btn-block">
                                    Crear tarea
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Creation;