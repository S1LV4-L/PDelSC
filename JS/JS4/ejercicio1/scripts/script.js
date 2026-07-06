import { initNightDayButton } from "../modules/nightDayBtn.js";

initNightDayButton();

// Función usando Fetch con POST al servidor
async function obtenerUsuarios() {
    const url = '/api/usuarios';
    const lista = document.getElementById('usuarios-lista-fetch');
    if (!lista) return;
    lista.innerHTML = '';

    try {
        const respuesta = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({})
        });

        if (!respuesta.ok) {
            throw new Error(`Error en la petición: ${respuesta.status}`);
        }

        const usuarios = await respuesta.json();
        renderizarUsuarios(usuarios, lista);

    } catch (error) {
        console.error('Error con Fetch:', error);
        lista.innerHTML = `<li>Error al cargar usuarios.</li>`;
    }
}

// Función usando Axios con POST al servidor
async function obtenerUsuariosConAxios() {
    const url = '/api/usuarios';
    const lista = document.getElementById('usuarios-lista-axios');
    if (!lista) return;
    lista.innerHTML = '';

    try {
        const respuesta = await axios({
            method: 'post',
            url: url,
            data: {}
        });
        const usuarios = respuesta.data;
        renderizarUsuarios(usuarios, lista);

    } catch (error) {
        console.error('Error con Axios:', error);
        lista.innerHTML = `<li class="fs-4">Error al cargar usuarios con Axios.</li>`;
    }
}

// Función de renderizado
function renderizarUsuarios(usuarios, elementoLista) {
    elementoLista.innerHTML = ''; // Limpieza de seguridad
    usuarios.forEach(usuario => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${usuario.name}</strong> - ${usuario.email}`;
        elementoLista.appendChild(li);
    });
}

obtenerUsuarios();
obtenerUsuariosConAxios();