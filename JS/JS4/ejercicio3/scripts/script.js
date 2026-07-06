import { initNightDayButton } from "../modules/nightDayBtn.js";
import { initBackToTopButton } from "../modules/backToTopBtn.js";

initNightDayButton();
initBackToTopButton();

// Referencias a elementos del DOM
const inputNombre = document.getElementById("nombre");
const errorNombreDiv = document.getElementById("errorNombre");
const listaUsuarios = document.getElementById("usuarios-lista");

const regexNombre = /^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]*$/;

let usuariosOriginal = [];

// Filtra en vivo mientras se escribe en el input
inputNombre.addEventListener("input", () => {
    const valor = inputNombre.value.trim();

    if (!regexNombre.test(valor)) {
        errorNombreDiv.textContent = "El nombre no puede contener números ni caracteres especiales.";
        return;
    }

    errorNombreDiv.textContent = "";

    const filtrados = usuariosOriginal.filter(u =>
        u.name.toLowerCase().includes(valor.toLowerCase())
    );

    renderizarUsuarios(filtrados, listaUsuarios);
});

// Renderiza la lista de usuarios obtenidos de la API
function renderizarUsuarios(usuarios, lista) {
    lista.innerHTML = "";
    usuarios.forEach(usuario => {
        const li = document.createElement("li");
        li.className = "mb-2";
        li.textContent = `${usuario.name} (${usuario.email})`;
        lista.appendChild(li);
    });
}

async function obtenerUsuariosConAxios() {
    const url = '/api/usuarios';
    if (!listaUsuarios) return;

    try {
        const respuesta = await axios({
            method: 'post',
            url: url,
            data: {}
        });
        usuariosOriginal = respuesta.data;
        renderizarUsuarios(usuariosOriginal, listaUsuarios);

    } catch (error) {
        console.error('Error con Axios:', error);
        listaUsuarios.innerHTML = `<li class="fs-4">Error al cargar usuarios con Axios.</li>`;
    }
}

obtenerUsuariosConAxios();