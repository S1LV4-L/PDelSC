import { useState } from "react";
import "../styles/FormularioNombre.css";

const MAX_CARACTERES = 50;
const MIN_CARACTERES = 2;
const REGEX_SOLO_LETRAS = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;

export function InitForm() {
    const [nombre, setNombre] = useState(""); // Valor actual del input
    const [nombreEnviado, setNombreEnviado] = useState(""); // Copia del nombre en el momento del submit, para no depender de "nombre" tras vaciar el input
    const [enviado, setEnviado] = useState(false); // Controla si se muestra el mensaje de bienvenida
    const [error, setError] = useState("");

    // Se ejecuta al enviar el formulario: valida el nombre y si es válido muestra el mensaje de bienvenida durante 5 segundos
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault(); // evita que el form recargue la página
        const texto = nombre.trim();

        if (!texto) {
            setError("El nombre no puede estar vacío");
            return;
        }

        if (!REGEX_SOLO_LETRAS.test(texto)) {
            setError("El nombre solo puede contener letras");
            return;
        }

        if (texto.length < MIN_CARACTERES || texto.length > MAX_CARACTERES) {
            setError(`El nombre debe tener entre ${MIN_CARACTERES} y ${MAX_CARACTERES} caracteres`);
            return;
        }

        setError("");
        setNombreEnviado(texto);
        setEnviado(true);
        setNombre("");

        setTimeout(() => {
            setEnviado(false);
        }, 5000);
    };

    return (
        <div className="formulario-container">
            {/* Formulario controlado: el valor del input se guarda en el estado "nombre" */}
            <form className="formulario-input" onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Ingresá tu nombre"
                    maxLength={MAX_CARACTERES}
                />
                <button type="submit">Enviar</button>
            </form>

            {error && <p className="formulario-error">{error}</p>}

            {/* mensaje de bienvenida, evita que el layout salte */}
            <div className="formulario-mensaje">
                {enviado && (  /* Si se envio (true) se muestra, si no se oculta */
                    <p className="formulario-bienvenida">Bienvenido/a, {nombreEnviado}!</p>
                )}
            </div>
        </div>
    );
}