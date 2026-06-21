export function initNightDayButton() {
    const btnTema = document.getElementById("btnTema");
    const btnIcono = document.getElementById("btnTemaIcono");
    const btnTexto = document.getElementById("btnTemaTexto");
    const html = document.documentElement;

    if (!btnTema || !btnIcono || !btnTexto) return;

    btnTema.addEventListener("click", () => {
        const temaActual = html.getAttribute("data-bs-theme");
        const nuevoTema = temaActual === "dark" ? "light" : "dark";

        html.setAttribute("data-bs-theme", nuevoTema);

        const elementosTexto = document.querySelectorAll(".text-white, .text-black");

        if (nuevoTema === "dark") {
            btnIcono.textContent = "🌙";
            btnTexto.textContent = "Modo claro";

            btnTema.classList.replace("btn-outline-dark", "btn-outline-light");

            elementosTexto.forEach(el => el.classList.replace("text-black", "text-white"));
        } else {
            btnIcono.textContent = "☀️";
            btnTexto.textContent = "Modo oscuro";

            btnTema.classList.replace("btn-outline-light", "btn-outline-dark");

            elementosTexto.forEach(el => el.classList.replace("text-white", "text-black"));
        }
    });
}