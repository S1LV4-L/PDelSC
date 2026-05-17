const registro = document.getElementById("registro");

const soloLetras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+([a-zA-ZáéíóúÁÉÍÓÚñÑ ]*[a-zA-ZáéíóúÁÉÍÓÚñÑ]+)?$/;


// Form 1: Filtra los números mayores a 10 de un array.
let numeros = [];
const input1 = document.getElementById("input1");
const btn1 = document.getElementById("btn1");

document.getElementById("form1").addEventListener("submit", (e) => {
    e.preventDefault();

    const raw = input1.value.trim();

    if (raw === "") {
        mostrarError("Ingresá un número.");
        return;
    }

    numeros.push(Number(raw));
    mostrarResultado("numeros[]", numeros);
    input1.value = "";
});

btn1.addEventListener("click", () => {
    if (numeros.length === 0) {
        mostrarError("Agregá al menos un número antes de filtrar.");
        return;
    }

    const filtrados = numeros.filter(num => num > 10);

    mostrarResultado("numeros[] (original)", numeros);

    if (filtrados.length === 0) {
        mostrarError("Ningún número es mayor a 10.");
        return;
    }

    mostrarResultado("Números mayores a 10", filtrados);
});


// Form 2: Dado un array de palabras, filtra las que tengan más de 5 letras.
let palabras = [];
const input2 = document.getElementById("input2");
const btn2 = document.getElementById("btn2");

document.getElementById("form2").addEventListener("submit", (e) => {
    e.preventDefault();

    const valor = input2.value.trim();

    if (valor === "") {
        mostrarError("Ingresá una palabra.");
        return;
    }

    if (!soloLetras.test(valor)) {
        mostrarError("La palabra solo puede contener letras.");
        return;
    }

    palabras.push(valor);
    mostrarResultado("palabras[]", palabras);
    input2.value = "";
});

btn2.addEventListener("click", () => {
    if (palabras.length === 0) {
        mostrarError("Agregá al menos una palabra antes de filtrar.");
        return;
    }

    const palabrasFiltradas = palabras.filter(palabra => palabra.length > 5);

    mostrarResultado("palabras[] (original)", palabras);

    if (palabrasFiltradas.length === 0) {
        mostrarError("Ninguna palabra tiene más de 5 letras.");
        return;
    }

    mostrarResultado("Palabras con más de 5 letras", palabrasFiltradas);
});


// Form 3: Filtra los usuarios activos de un array de objetos {nombre, activo}.
let usuarios = [];
const input3 = document.getElementById("input3");
const estado = document.getElementById("estado");
const btn3 = document.getElementById("btn3");

document.getElementById("form3").addEventListener("submit", (e) => {
    e.preventDefault();

    const nombre = input3.value.trim();
    const estadoVal = estado.value;

    if (nombre === "") {
        mostrarError("Ingresá un nombre de usuario.");
        return;
    }

    if (!isNaN(nombre)) {
        mostrarError("El nombre de usuario no puede ser solo números.");
        return;
    }

    if (nombre.length < 3) {
        mostrarError("El nombre de usuario debe tener al menos 3 caracteres.");
        return;
    }

    if (estadoVal === "") {
        mostrarError("Seleccioná un estado.");
        return;
    }

    usuarios.push({ nombre, estado: estadoVal });
    mostrarResultado("usuarios[]", usuarios.map(u => `${u.nombre} (${u.estado})`));

    input3.value = "";
    estado.value = "";
});

btn3.addEventListener("click", () => {
    if (usuarios.length === 0) {
        mostrarError("Agregá al menos un usuario antes de filtrar.");
        return;
    }

    const activos = usuarios.filter(u => u.estado === "activo");

    mostrarResultado("usuarios[] (original)", usuarios.map(u => `${u.nombre} (${u.estado})`));

    if (activos.length === 0) {
        mostrarError("No hay usuarios activos.");
        return;
    }

    mostrarResultado("Usuarios activos", activos.map(u => u.nombre));
});


function mostrarResultado(label, valor) {
    const p = document.createElement("p");
    p.className = "mb-1";

    const etiqueta = document.createElement("strong");
    etiqueta.textContent = label + ": ";

    const contenido = Array.isArray(valor) ? valor.join(", ") : valor;
    const span = document.createElement("span");
    span.textContent = "'" + contenido + "'";

    p.appendChild(etiqueta);
    p.appendChild(span);
    registro.appendChild(p);
    registro.scrollTop = registro.scrollHeight;
}

function mostrarError(msg) {
    const p = document.createElement("p");
    p.className = "text-danger mb-1";
    p.textContent = msg;
    registro.appendChild(p);
    registro.scrollTop = registro.scrollHeight;

    setTimeout(() => p.remove(), 3000);
}