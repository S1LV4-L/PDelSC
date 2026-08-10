import { useState, useEffect, useRef } from "react";
import "../styles/ListaTareas.css";

interface Tarea {
    id: number; // identificador único, usado como key y para operar sobre la tarea correcta (no se exporta)
    texto: string; // contenido de la tarea
    completada: boolean; // si ya fue marcada como completada
    saliendo: boolean; // true mientras se reproduce la transición de salida antes de eliminarla
}

const STORAGE_KEY = "tareas";
const MAX_CARACTERES = 150;
const REGEX_VALIDO = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s.,]+$/; // letras, números, espacios, puntos y comas

// Lee las tareas guardadas en localStorage al iniciar el componente. Se ejecuta una sola vez.
function cargarTareas(): Tarea[] {
    try {
        const guardado = localStorage.getItem(STORAGE_KEY);
        return guardado ? JSON.parse(guardado) : [];
    } catch {
        return [];
    }
}

// Genera un id único combinando timestamp y un número aleatorio, para evitar
// colisiones cuando se agregan o importan varias tareas muy rápido
function generarId(): number {
    return Date.now() + Math.random();
}

export default function TareasLista() {
    const [tareas, setTareas] = useState<Tarea[]>(cargarTareas);
    const [input, setInput] = useState(""); // texto actual del input
    const [error, setError] = useState(""); // mensaje de error a mostrar
    const inputArchivoRef = useRef<HTMLInputElement>(null); // referencia al input file oculto (importar)

    // Persiste las tareas en localStorage cada vez que cambian
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tareas));
    }, [tareas]);

    // Valida el texto de una tarea. Devuelve el mensaje de error o null si es válido.
    const validarTexto = (texto: string): string | null => {
        if (texto.length > MAX_CARACTERES) {
            return `La tarea no puede superar los ${MAX_CARACTERES} caracteres`;
        }
        if (!REGEX_VALIDO.test(texto)) {
            return "La tarea solo puede contener letras, números, puntos y comas";
        }
        return null;
    };

    // Agrega una nueva tarea a partir del input, validando texto vacío y reglas de validarTexto
    const agregarTarea = () => {
        const texto = input.trim();

        if (!texto) {
            setError("La tarea no puede estar vacía");
            return;
        }

        const errorValidacion = validarTexto(texto);
        if (errorValidacion) {
            setError(errorValidacion);
            return;
        }

        setError("");
        setTareas([...tareas, { id: generarId(), texto, completada: false, saliendo: false }]);
        setInput("");
    };

    // Marca una tarea pendiente como completada (pasa a la columna "Completadas")
    const completarTarea = (id: number) => {
        setTareas((prev) => prev.map((t) => (t.id === id ? { ...t, completada: true } : t)));
    };

    // Elimina una tarea completada: primero dispara la transición de salida y después de 300ms la saca del estado
    const eliminarTarea = (id: number) => {
        setTareas((prev) => prev.map((t) => (t.id === id ? { ...t, saliendo: true } : t)));
        setTimeout(() => {
            setTareas((prev) => prev.filter((t) => t.id !== id));
        }, 300);
    };

    // Exporta todas las tareas a un archivo .txt, una por línea, con el formato "estado|texto"
    // (estado: "1" completada, "0" pendiente). El id nunca se incluye en el archivo.
    const exportarTareas = () => {
        const contenido = tareas.map((t) => `${t.completada ? "1" : "0"}|${t.texto}`).join("\n");
        const blob = new Blob([contenido], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "tareas.txt";
        a.click();
        URL.revokeObjectURL(url);
    };

    // Abre el selector de archivos oculto al hacer click en "Importar"
    const abrirSelectorImportar = () => {
        inputArchivoRef.current?.click();
    };

    // Lee el archivo .txt seleccionado, valida cada línea y reemplaza por completo la lista de tareas actual.
    // Cada tarea importada recibe un id nuevo generado en el momento.
    const importarTareas = (e: React.ChangeEvent<HTMLInputElement>) => {
        const archivo = e.target.files?.[0];
        if (!archivo) return;

        const lector = new FileReader();
        lector.onload = (evento) => {
            try {
                const contenido = evento.target?.result as string;
                const lineas = contenido
                    .split("\n")
                    .map((linea) => linea.trim())
                    .filter((linea) => linea.length > 0);

                const tareasImportadas: Tarea[] = lineas.map((linea) => {
                    const separador = linea.indexOf("|");
                    if (separador === -1) throw new Error("Formato inválido");

                    const estado = linea.slice(0, separador);
                    const texto = linea.slice(separador + 1);

                    if (estado !== "0" && estado !== "1") throw new Error("Formato inválido");
                    if (validarTexto(texto)) throw new Error("Contiene tareas inválidas");

                    return { id: generarId(), texto, completada: estado === "1", saliendo: false };
                });

                setTareas(tareasImportadas);
                setError("");
            } catch {
                setError("El archivo no tiene un formato válido");
            }
        };
        lector.readAsText(archivo);

        e.target.value = ""; // permite volver a importar el mismo archivo si hace falta
    };

    // Separación de tareas en dos listas según su estado, para renderizar cada columna
    const pendientes = tareas.filter((t) => !t.completada);
    const completadas = tareas.filter((t) => t.completada);

    return (
        <div className="tareas-container">
            <div className="tareas-input">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && agregarTarea()}
                    placeholder="Agregar tarea"
                    maxLength={MAX_CARACTERES}
                />
                <button onClick={exportarTareas}>Exportar</button>
                <button onClick={abrirSelectorImportar}>Importar</button>
                {/* Input file oculto: se activa mediante el botón "Importar" */}
                <input
                    type="file"
                    accept=".txt"
                    ref={inputArchivoRef}
                    onChange={importarTareas}
                    style={{ display: "none" }}
                />
            </div>

            {error && <p className="tareas-error">{error}</p>}

            <div className="tareas-columnas">
                {/* Columna de tareas pendientes: click marca como completada */}
                <div className="tareas-columna">
                    <h2 className="tareas-titulo">Pendientes</h2>
                    <p className="tareas-ayuda">Click para marcar como completada</p>
                    <ul className="tareas-lista">
                        {pendientes.map((t) => (
                            <li key={t.id} className={`tarea-item ${t.saliendo ? "tarea-saliendo" : ""}`}
                                onClick={() => completarTarea(t.id)}>
                                {t.texto}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Columna de tareas completadas: click elimina la tarea */}
                <div className="tareas-columna">
                    <h2 className="tareas-titulo">Completadas</h2>
                    <p className="tareas-ayuda">Click para eliminar</p>
                    <ul className="tareas-lista">
                        {completadas.map((t) => (
                            <li key={t.id} className={`tarea-item tarea-completada ${t.saliendo ? "tarea-saliendo" : ""}`}
                                onClick={() => eliminarTarea(t.id)}>
                                {t.texto}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}