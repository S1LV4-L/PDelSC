// Btn 1: Ordena un array de números de menor a mayor.
document.getElementById("btn1").addEventListener("dblclick", () => {
    const registro = document.getElementById("registro");

    let numeros = [3, 4, 1, 2, 5];
    registro.appendChild(crearMensajeRegistro("numeros[]", numeros));

    numeros.sort((a, b) => a - b);

    registro.appendChild(crearMensajeRegistro("numeros[] (ordenado)", numeros));
}, { once: true });


// Btn 2: Ordena un array de palabras alfabéticamente.
const btn2 = document.getElementById("btn2");
btn2.addEventListener("mouseover", () => {
    const registro = document.getElementById("registro");

    let palabras = ["elefante", "casa", "agua", "dado", "banco"];
    registro.appendChild(crearMensajeRegistro("palabras[]", palabras));

    palabras.sort();

    registro.appendChild(crearMensajeRegistro("palabras[] (ordenado)", palabras));
}, { once: true });


// Btn 3: Dado un array de objetos {nombre, edad}, ordénalos por edad.
const btn3 = document.getElementById("btn3");
btn3.addEventListener("contextmenu", () => {
    const registro = document.getElementById("registro");

    let usuarios = [
        { nombre: "Ana", edad: 34 },
        { nombre: "Carlos", edad: 29 },
        { nombre: "María", edad: 63 },
        { nombre: "Juan", edad: 20 }
    ];
    registro.appendChild(crearMensajeRegistro("usuarios[]", usuarios.map(u => `${u.nombre} (${u.edad})`)));

    usuarios.sort((a, b) => a.edad - b.edad);
    registro.appendChild(crearMensajeRegistro("usuarios[] (ordenado por edad)", usuarios.map(u => `${u.nombre} (${u.edad})`)));
}, { once: true });


function crearMensajeRegistro(label, valor) {
    const mensaje = document.createElement("p");
    const texto1 = document.createElement("strong");
    texto1.textContent = label + ": ";

    const contenido = Array.isArray(valor) ? valor.join(", ") : valor;

    const valorSpan = document.createElement("span");
    valorSpan.textContent = contenido;

    mensaje.appendChild(texto1);
    mensaje.append(" '");
    mensaje.appendChild(valorSpan);
    mensaje.append("'");

    return mensaje;
}