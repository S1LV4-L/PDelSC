import { useState } from "react";
import "../styles/estilos.css";

const STORAGE_KEY = "contador-value"; // Clave constante para identificar el dato guardado en la memoria de la sesión

// Componente que recibe un valor inicial por props
export function Contador({ value: initialState }: { value: number }) {
    
    // Inicializa el estado usando "Inicialización Perezosa" (lazy initialization):
    const [value, setValue] = useState<number>(() => {
        const saved = sessionStorage.getItem(STORAGE_KEY);    // Intenta leer el valor guardado en sessionStorage.
        // Si existe, lo convierte a número y lo usa, si no usa el que le llega por props.
        return saved !== null ? Number(saved) : initialState;
    });

    // Función auxiliar que sincroniza el estado de React con el sessionStorage. Se llama cada vez que se hace clic en un botón.
    const updateValue = (newValue: number) => {
        setValue(newValue); // Actualiza la interfaz
        sessionStorage.setItem(STORAGE_KEY, String(newValue)); // Persiste el dato
    };

    return (
        <div className="containerStyle">
            {/* Muestra el valor actual del estado */}
            <strong className="numeroStyle">{value}</strong>
            
            <div className="botones-container">
                <button className="buttonStyle" onClick={() => updateValue(value - 1)}>
                    Decrementar
                </button>
                
                <button className="buttonStyle" onClick={() => updateValue(value + 1)}>
                    Incrementar
                </button>
            </div>
        </div>
    );
}