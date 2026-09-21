import { useEffect, useState } from "react";
import "../styles/BotonScrollTop.css";

// Umbral de scroll (en píxeles) a partir del cual se muestra el botón
const UMBRAL_SCROLL = 300;

// Componente que muestra un botón flotante para volver al inicio de la página
export function BotonScrollTop() {
    // Estado que controla si el botón es visible según el scroll actual
    const [visible, setVisible] = useState(false);

    // Efecto secundario que escucha el scroll y actualiza la visibilidad
    useEffect(() => {
        const manejarScroll = () => {
            setVisible(window.scrollY > UMBRAL_SCROLL);
        };

        window.addEventListener("scroll", manejarScroll);
        manejarScroll(); // Chequea el estado inicial por si la página ya carga con scroll

        return () => window.removeEventListener("scroll", manejarScroll);
    }, []);

    // Función que lleva el scroll de vuelta al inicio con animación suave
    const volverArriba = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // Botón renderizado
    return (
        <button
            className={`scroll-top ${visible ? "scroll-top--visible" : ""}`}
            onClick={volverArriba}
            aria-label="Volver arriba" // Etiqueta descriptiva para lectores de pantalla
            aria-hidden={!visible} // Oculta el botón de lectores de pantalla cuando no es visible
            tabIndex={visible ? 0 : -1} // Evita que reciba foco por teclado cuando está oculto
        />
    );
}