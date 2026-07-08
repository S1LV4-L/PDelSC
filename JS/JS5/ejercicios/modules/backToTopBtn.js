export function initBackToTopButton() {
    // INYECTAR ESTILOS
    const style = document.createElement("style");
    style.textContent = `
        #btn-back-to-top {
            position: fixed;
            bottom: 6vh;
            right: 3vh;
            display: none;
            width: 2rem;
            height: 2rem;
            padding: 0.3rem;
            align-items: center;
            justify-content: center;
            z-index: 1050;
        }
        #btn-back-to-top img {
            width: 100% !important;
            height: 100% !important;
            object-fit: contain;
        }
        @media (min-width: 992px) {
            #btn-back-to-top {
                bottom: 4vh;
                right: 10vh;
            }
        }
    `;
    document.head.appendChild(style);

    // CREAR E INYECTAR EL BOTÓN AL FINAL DEL BODY
    const btn = document.createElement("button");
    btn.type = "button";
    btn.id = "btn-back-to-top";
    btn.className = "btn border rounded-3 border-discovery-subtle btn-floating btn-lg";
    btn.innerHTML = `<img class="img-fluid" src="https://uxwing.com/wp-content/themes/uxwing/download/arrow-direction/up-arrow-icon.png" alt="boton volver arriba">`;

    document.body.appendChild(btn);

    const contenedorInterno = document.querySelector('.layout-principal .overflow-y-auto');

    // LÓGICA DE VISIBILIDAD Y SCROLL
    const handleScroll = () => {
        const scrollWindow = window.scrollY || document.documentElement.scrollTop;
        const scrollInterno = contenedorInterno ? contenedorInterno.scrollTop : 0;
        const scrollTop = Math.max(scrollWindow, scrollInterno);

        if (scrollTop > 300) {
            btn.style.display = "flex";
        } else {
            btn.style.display = "none";
        }
    };

    // Escuchar scroll en ambos lugares posibles
    window.addEventListener("scroll", handleScroll);
    if (contenedorInterno) {
        contenedorInterno.addEventListener("scroll", handleScroll);
    }

    // ACCIÓN DE VOLVER ARRIBA
    btn.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        if (contenedorInterno) {
            contenedorInterno.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });
}