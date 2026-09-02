import { useParams, Link } from "react-router-dom";
import { useTareas } from "../hooks/useTareas";
import "../styles/Details.css";
import { ThemeToggle } from "../components/BotonTema";

// Página de detalle: muestra la información completa de una tarea según el id de la URL
function Details() {
    const { id } = useParams();
    const { obtenerTareaPorId } = useTareas();
    const tarea = obtenerTareaPorId(id!);

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

    return (
        <>
            <ThemeToggle />
            <div className="page details-page">
                <div className="page-inner">
                    <p className="nombrePag">DETALLES</p>
                    
                    <div className="details-card">
                        <header className="details-header">
                            <div className="headerPag">
                                <h1 className="details-title">{tarea.titulo}</h1>
                                <Link to="/" className="volver btn btn-ghost">
                                    Volver
                                </Link>
                            </div>
                        </header>

                        {/* Estado (completa/pendiente) y fecha de creación formateada */}
                        <div className="details-info-row">
                            <span className={`status-pill ${tarea.completa ? "status-pill--complete" : "status-pill--pending"}`}>
                                {tarea.completa ? "Completa" : "Pendiente"}
                            </span>
                            <span className="details-meta">
                                {new Date(tarea.fechaCreacion).toLocaleDateString()}
                            </span>
                        </div>
                        
                        <p className="details-desc">{tarea.descripcion}</p>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Details;