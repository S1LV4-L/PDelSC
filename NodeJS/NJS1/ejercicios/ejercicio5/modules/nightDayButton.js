export function initNightDayButton() {
    const btnTema = document.getElementById("btnTema");
    const html = document.documentElement;
    
    const icono = document.getElementById("btnTemaIcono");
    const texto = document.getElementById("btnTemaTexto");

    if (!btnTema) return;

    btnTema.addEventListener("click", () => {
        const temaActual = html.getAttribute("data-bs-theme");
        const nuevoTema = temaActual === "dark" ? "light" : "dark";
        
        html.setAttribute("data-bs-theme", nuevoTema);
        
        if (nuevoTema === "dark") {
            if (icono) icono.textContent = "🌙";
            if (texto) texto.textContent = "Modo claro";
        } else {
            if (icono) icono.textContent = "☀️";
            if (texto) texto.textContent = "Modo oscuro";
        }
    });
}