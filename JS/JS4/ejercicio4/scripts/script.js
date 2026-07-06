import { initNightDayButton } from "../modules/nightDayBtn.js";
import { initBackToTopButton } from "../modules/backToTopBtn.js";

initNightDayButton();
initBackToTopButton();

const listaFeriados = document.getElementById("feriados-lista");
const sinResultados = document.getElementById("sin-resultados");
const heroNombre = document.getElementById("hero-nombre");
const heroFecha = document.getElementById("hero-fecha");
const cuentaRegresiva = document.getElementById("cuenta-regresiva");
const selectorMes = document.getElementById("selector-mes");

// Muestra el año actual en el footer
document.getElementById("footer-anio").textContent = new Date().getFullYear();

// Almacena los feriados que devuelve la API
let feriadosRestantes = [];
let feriadosTodos = [];

// Pide los feriados al backend y lanza el renderizado
async function obtenerFeriados() {
    try {
        const respuesta = await axios.post("/api/feriados");
        feriadosRestantes = respuesta.data.feriados;
        feriadosTodos = respuesta.data.feriadosTodos;
        renderizarHero();
        iniciarCuentaRegresiva();
        renderizarFeriados();
    } catch (error) {
        // Muestra un mensaje de error directamente en la lista si falla la petición
        listaFeriados.innerHTML = `
            <div class="col-12">
                <p class="fs-5 text-danger mb-0">
                    <i class="fa-solid fa-triangle-exclamation me-2"></i>Error al cargar los feriados.
                </p>
            </div>
        `;
    }
}

// Completa el hero con el nombre y la fecha escrita del próximo feriado
function renderizarHero() {
    if (feriadosRestantes.length === 0) {
        document.getElementById("proximo-feriado-hero").classList.add("d-none");
        return;
    }
    heroNombre.textContent = feriadosRestantes[0].nombre;
    heroFecha.textContent = formatearFechaLarga(feriadosRestantes[0].fecha);
}

// Calcula la diferencia entre ahora y el próximo feriado, la muestra y se actualiza cada segundo
function iniciarCuentaRegresiva() {
    if (feriadosRestantes.length === 0) return;

    function actualizar() {
        const fechaProximo = parsearFecha(feriadosRestantes[0].fecha);
        const diff = fechaProximo.getTime() - Date.now();

        // Si ya llegó la fecha del feriado, muestra "¡Hoy!"
        if (diff <= 0) {
            cuentaRegresiva.innerHTML = `
                <div class="d-flex flex-column align-items-center">
                    <span class="fs-4 fw-bold lh-1">¡Hoy!</span>
                </div>
            `;
            return;
        }

        // Descompone la diferencia en días, horas, minutos y segundos
        const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
        const horas = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutos = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const segundos = Math.floor((diff % (1000 * 60)) / 1000);

        // Genera un bloque por cada unidad de tiempo usando clases de Bootstrap para el tamaño
        cuentaRegresiva.innerHTML = `
            <div class="d-flex flex-column align-items-center">
                <span class="fs-4 fw-bold lh-1 cuenta-numero">${String(dias).padStart(2, "0")}</span>
                <span class="text-uppercase small opacity-75 mt-1">Días</span>
            </div>
            <div class="d-flex flex-column align-items-center">
                <span class="fs-4 fw-bold lh-1 cuenta-numero">${String(horas).padStart(2, "0")}</span>
                <span class="text-uppercase small opacity-75 mt-1">Horas</span>
            </div>
            <div class="d-flex flex-column align-items-center">
                <span class="fs-4 fw-bold lh-1 cuenta-numero">${String(minutos).padStart(2, "0")}</span>
                <span class="text-uppercase small opacity-75 mt-1">Minutos</span>
            </div>
            <div class="d-flex flex-column align-items-center">
                <span class="fs-4 fw-bold lh-1 cuenta-numero">${String(segundos).padStart(2, "0")}</span>
                <span class="text-uppercase small opacity-75 mt-1">Segundos</span>
            </div>
        `;
    }

    actualizar();
    // Refresca el reloj cada segundo
    setInterval(actualizar, 1000);
}

// Filtra los feriados según el mes seleccionado y genera las cards
function renderizarFeriados() {
    listaFeriados.innerHTML = "";
    const valor = selectorMes.value;
    let lista;

    // "proximos" muestra los que faltan, cualquier otro valor filtra por ese mes
    if (valor === "proximos") {
        lista = feriadosRestantes;
    } else {
        lista = feriadosTodos.filter(f => f.mes === parseInt(valor));
    }

    // Muestra mensaje si no hay feriados para esa selección
    if (lista.length === 0) {
        sinResultados.classList.remove("d-none");
        return;
    }

    sinResultados.classList.add("d-none");

    // Marca el primero solo si se está viendo "Próximos feriados"
    const esProximoVista = valor === "proximos";

    // Crea una card por cada feriado
    lista.forEach((f, i) => {
        const esProximo = esProximoVista && i === 0;
        const col = document.createElement("div");
        col.className = "col-12 col-md-6 col-lg-4";
        col.innerHTML = `
            <div class="card ${esProximo ? "border-primary border-2" : "border-discovery"} rounded-3 shadow-sm bg-secondary bg-opacity-10 h-100">
                <div class="card-body p-4 d-flex flex-column gap-2">
                    ${esProximo
                        ? '<span class="badge bg-primary align-self-start"><i class="fa-solid fa-bolt me-1"></i>Próximo</span>'
                        : ""}
                    <h5 class="card-title fw-semibold mb-0">${f.nombre}</h5>
                    <p class="card-text text-secondary mb-0">
                        <i class="fa-regular fa-calendar me-1"></i>${f.fecha}
                    </p>
                    <span class="badge ${f.tipo === "trasladable" ? "bg-info" : "bg-dark"} text-white align-self-start">
                        ${f.tipo === "trasladable" ? "Trasladable" : "Inamovible"}
                    </span>
                </div>
            </div>
        `;
        listaFeriados.appendChild(col);
    });
}

// Convierte "dd/mm/aaaa" a un objeto Date
function parsearFecha(fechaStr) {
    const [dia, mes, anio] = fechaStr.split("/").map(Number);
    return new Date(anio, mes - 1, dia);
}

// Convierte "dd/mm/aaaa" a texto largo en español, ej: "lunes 25 de mayo de 2025"
function formatearFechaLarga(fechaStr) {
    return parsearFecha(fechaStr).toLocaleDateString("es-AR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    });
}

// Re-renderiza la lista cada vez que cambia el select
selectorMes.addEventListener("change", renderizarFeriados);

// arranca todo al cargar
obtenerFeriados();