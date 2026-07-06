export function initNightDayButton() {
    const btnTema = document.getElementById("btnTema");
    const btnIcono = document.getElementById("btnTemaIcono");
    const btnTexto = document.getElementById("btnTemaTexto");
    const html = document.documentElement;

    if (!btnTema || !btnIcono || !btnTexto) return;

    btnTema.addEventListener("click", () => {
        const temaActual = html.getAttribute("data-bs-theme");
        const nuevoTema = temaActual === "dark" ? "light" : "dark";

        html.classList.add("tema-cambiando");

        void html.offsetWidth;

        html.setAttribute("data-bs-theme", nuevoTema);

        if (nuevoTema === "dark") {
            btnIcono.textContent = "🌙";
            btnTexto.textContent = "Modo claro";
            btnTema.classList.remove("btn-outline-dark");
            btnTema.classList.add("btn-outline-light");
        } else {
            btnIcono.textContent = "☀️";
            btnTexto.textContent = "Modo oscuro";
            btnTema.classList.remove("btn-outline-light");
            btnTema.classList.add("btn-outline-dark");
        }

        setTimeout(() => {
            html.classList.remove("tema-cambiando");
        }, 450);
    });
}