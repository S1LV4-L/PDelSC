import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTareas } from "../hooks/useTareas";
import "../styles/Home.css";
import { ThemeToggle } from "../components/BotonTema";
import { BotonScrollTop } from "../components/BotonScrollTop";

function Home() {
    const { tareas, completarTarea, eliminarTarea, setTareas } = useTareas();
    const inputArchivoRef = useRef<HTMLInputElement>(null);
    const [errorImportacion, setErrorImportacion] = useState<string | null>(null);
    const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);

    // Limpia el mensaje de error automáticamente a los 10 segundos
    useEffect(() => {
        if (!errorImportacion) return;

        const timer = setTimeout(() => setErrorImportacion(null), 10000);
        return () => clearTimeout(timer);
    }, [errorImportacion]);

    // --- LÓGICA DE BOTONES EXTRA ---

    const exportarTareas = () => {
        if (tareas.length === 0) return;
        // Formato: estado|titulo|descripcion
        const contenido = tareas.map((t) => `${t.completa ? "1" : "0"}|${t.titulo}|${t.descripcion}`).join("\n");
        const blob = new Blob([contenido], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "tareas.txt";
        a.click();
        URL.revokeObjectURL(url);
    };

    const abrirSelectorImportar = () => {
        inputArchivoRef.current?.click();
    };

    const importarTareas = (e: React.ChangeEvent<HTMLInputElement>) => {
        const archivo = e.target.files?.[0];
        if (!archivo) return;

        const lector = new FileReader();
        lector.onload = (evento) => {
            try {
                const contenido = evento.target?.result as string;
                const lineas = contenido.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);

                const tareasImportadas = lineas.map((linea) => {
                    const partes = linea.split("|");
                    if (partes.length < 3) throw new Error("Formato inválido");

                    const estado = partes[0];
                    const titulo = partes[1];
                    // slice y join por si el usuario usó '|' en la descripción
                    const descripcion = partes.slice(2).join("|");

                    if (estado !== "0" && estado !== "1") throw new Error("Formato inválido");

                    return {
                        id: crypto.randomUUID(),
                        titulo,
                        descripcion,
                        completa: estado === "1",
                        fechaCreacion: new Date().toISOString()
                    };
                });

                setTareas(tareasImportadas);
                setErrorImportacion(null);
            } catch {
                setErrorImportacion("El archivo no tiene un formato válido (estado|título|descripción).");
            }
        };
        lector.readAsText(archivo);
        e.target.value = ""; // Permite importar el mismo archivo dos veces
    };

    const marcarTodas = () => {
        if (tareas.length === 0) return;
        setTareas(tareas.map((t) => ({ ...t, completa: true })));
    };

    const eliminarTodas = () => {
        if (tareas.length === 0) return;
        setMostrarConfirmacion(true);
    };

    const confirmarEliminarTodas = () => {
        setTareas([]);
        setMostrarConfirmacion(false);
    };

    const cancelarEliminarTodas = () => {
        setMostrarConfirmacion(false);
    };

    return (
        <>
            <ThemeToggle />
            <div className="page home-page">
                <div className="page-inner">
                    <p className="nombrePag">Panel de Tareas</p>

                    <header className="home-header">
                        <div className="headerPag">
                            <h1 className="home-title">Lista de Tareas</h1>
                            <Link to="/crear" className="crear btn btn-ghost">
                                Nueva tarea
                            </Link>
                        </div>
                    </header>

                    <div className="extra-buttons">
                        <button type="button" className="extra-btn" onClick={exportarTareas}>
                            Exportar Lista
                        </button>
                        <button type="button" className="extra-btn" onClick={abrirSelectorImportar}>
                            Importar Lista
                        </button>
                        <button type="button" className="extra-btn extra-btn--success" onClick={marcarTodas}>
                            Completar todas
                        </button>
                        <button type="button" className="extra-btn extra-btn--danger" onClick={eliminarTodas}>
                            Eliminar todas
                        </button>
                        {/* Input file oculto para la importación */}
                        <input
                            type="file"
                            accept=".txt"
                            ref={inputArchivoRef}
                            onChange={importarTareas}
                            style={{ display: "none" }}
                        />
                    </div>

                    {mostrarConfirmacion && (
                        <div className="confirm-box">
                            <p className="confirm-text">¿Estas seguro de que queres eliminar TODAS las tareas?</p>
                            <div className="confirm-actions">
                                <button type="button" className="confirm-btn confirm-btn--si" onClick={confirmarEliminarTodas}>
                                    Si
                                </button>
                                <button type="button" className="confirm-btn confirm-btn--no" onClick={cancelarEliminarTodas}>
                                    No
                                </button>
                            </div>
                        </div>
                    )}

                    {errorImportacion && <p className="import-error">{errorImportacion}</p>}

                    {tareas.length === 0 ? (<p className="empty-state">Todavía no creaste ninguna tarea.</p>) : (
                        <ul className="task-list">{
                            tareas.map((t) => (
                                <li key={t.id}>
                                    <Link to={`/tarea/${t.id}`}
                                        className={`task-card ${t.completa ? "task-card--complete" : "task-card--pending"}`}>
                                        <div>
                                            <span className="task-title">{t.titulo}</span>
                                            <span className="task-desc">{t.descripcion}</span>
                                        </div>

                                        <div className="task-actions">
                                            {!t.completa && (
                                                <button className="task-btn task-btn--complete"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        completarTarea(t.id);
                                                    }}>
                                                    Completar
                                                </button>
                                            )}
                                            <button className="task-btn task-btn--delete"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    eliminarTarea(t.id);
                                                }}>
                                                Eliminar
                                            </button>
                                        </div>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
            <BotonScrollTop/>
        </>
    );
}

export default Home;