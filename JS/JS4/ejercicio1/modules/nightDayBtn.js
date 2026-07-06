export function initNightDayButton() {
    const btnTema = document.getElementById("btnTema");
    const btnIcono = document.getElementById("btnTemaIcono");
    const btnTexto = document.getElementById("btnTemaTexto");
    const html = document.documentElement;

    if (!btnTema || !btnIcono || !btnTexto) return;

    // INYECTAR LA TRANSICIÓN DESDE JS
    const styleTransicion = document.createElement("style");
    styleTransicion.textContent = `
        body, .navbar, .card, .btn, .form-control, .form-select, a {
            transition: background-color 0.4s ease, color 0.4s ease, border-color 0.4s ease !important;
        }
    `;
    document.head.appendChild(styleTransicion);

    // INYECTAR ESTILO MOVIL PARA EL BOTÓN CUADRADO
    const styleMovil = document.createElement("style");
    styleMovil.textContent = `
        @media (max-width: 575.98px) {
            #btnTema {
                width: 2.5rem;
                height: 2.5rem;
                padding: 0 !important;
                display: flex !important;
                align-items: center;
                justify-content: center;
            }
            #btnTemaIcono {
                margin: 0 !important;
            }
        }
    `;
    document.head.appendChild(styleMovil);

    // LÓGICA DEL BOTÓN
    btnTema.addEventListener("click", () => {
        const temaActual = html.getAttribute("data-bs-theme");
        const nuevoTema = temaActual === "dark" ? "light" : "dark";
        
        html.setAttribute("data-bs-theme", nuevoTema);
        
        if (nuevoTema === "dark") {
            btnIcono.textContent = "🌙";
            btnTexto.textContent = "Modo claro";
            btnTema.classList.replace("btn-outline-dark", "btn-outline-light");
        } else {
            btnIcono.textContent = "☀️";
            btnTexto.textContent = "Modo oscuro";
            btnTema.classList.replace("btn-outline-light", "btn-outline-dark");
        }
    });
}