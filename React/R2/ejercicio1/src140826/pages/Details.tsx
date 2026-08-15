import { useParams, Link } from "react-router-dom";
import { useTareas } from "../hooks/useTareas";
import "../styles/Details.css";
import { ThemeToggle } from "../components/BotonTema";

function Details() {
    const { id } = useParams();
    const { obtenerTareaPorId } = useTareas();
    const tarea = obtenerTareaPorId(id!);

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