import { useState } from "react";
import "../styles/estilos.css";

const STORAGE_KEY = "contador-value";

export function Contador({ value: initialState }: { value: number }) {
    // Lee el valor guardado en sessionStorage al montar el componente, si no existe (nueva sesión) usa el valor inicial recibido por props.
    const [value, setValue] = useState<number>(() => {
        const saved = sessionStorage.getItem(STORAGE_KEY);
        return saved !== null ? Number(saved) : initialState;
    });

    // Actualiza el contador y persiste el nuevo valor en sessionStorage.
    // sessionStorage sobrevive a recargas de página pero se borra al cerrar la pestaña/navegador.
    const updateValue = (newValue: number) => {
        setValue(newValue);
        sessionStorage.setItem(STORAGE_KEY, String(newValue));
    };

    return (
        <div className="containerStyle">
            <button className="buttonStyle" onClick={() => updateValue(value + 1)}>
                Incrementar
            </button>
            <strong>{value}</strong>
            <button className="buttonStyle" onClick={() => updateValue(value - 1)}>
                Decrementar
            </button>
        </div>
    );
}