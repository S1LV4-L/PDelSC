export function initNightDayButton() {
    const btnTema = document.getElementById("btnTema");
    const html = document.documentElement;

    btnTema.addEventListener("click", () => {
        const temaActual = html.getAttribute("data-bs-theme");
        const nuevoTema = temaActual === "dark" ? "light" : "dark";
        html.setAttribute("data-bs-theme", nuevoTema);
        btnTema.textContent = nuevoTema === "dark" ? "🌙 Modo claro" : "☀️ Modo oscuro";
    });
}