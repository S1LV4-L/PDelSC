export function initNightDayButton() {
    const btnTema = document.getElementById("btnTema");
    const btnTemaIcono = document.getElementById("btnTemaIcono");
    const btnTemaTexto = document.getElementById("btnTemaTexto");
    const html = document.documentElement;

    btnTema.addEventListener("click", () => {
        const temaActual = html.getAttribute("data-bs-theme");
        const nuevoTema = temaActual === "dark" ? "light" : "dark";
        html.setAttribute("data-bs-theme", nuevoTema);
        btnTemaIcono.textContent = nuevoTema === "dark" ? "🌙" : "☀️";
        btnTemaTexto.textContent = nuevoTema === "dark" ? "Modo claro" : "Modo oscuro";
    });
}