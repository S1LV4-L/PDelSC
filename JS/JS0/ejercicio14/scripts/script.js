// Btn 1: Invierte un array de letras.
document.getElementById("btn1").addEventListener("dblclick", () => {
    const registro = document.getElementById("registro");

    let numeros = [1, 2, 3, 4, 5];
    registro.appendChild(crearMensajeRegistro("numeros[]", numeros));

    numeros.reverse();

    registro.appendChild(crearMensajeRegistro("numeros[] (ordenado)", numeros));
}, { once: true });


// Btn 2: Invierte el orden de un array de números.
const btn2 = document.getElementById("btn2");
btn2.addEventListener("mouseover", () => {
    const registro = document.getElementById("registro");

    let palabras = ["agua", "banco", "casa", "dado", "elefante"];
    registro.appendChild(crearMensajeRegistro("palabras[]", palabras));

    palabras.reverse();

    registro.appendChild(crearMensajeRegistro("palabras[] (ordenado)", palabras));
}, { once: true });


// Btn 3: Dado un string, conviertelo en array y revierte el texto.
const btn3 = document.getElementById("btn3");
btn3.addEventListener("contextmenu", () => {
    const registro = document.getElementById("registro");

    let ejemplo = "Texto de ejemplo";
    registro.appendChild(crearMensajeRegistro("String de ejemplo", ejemplo));

    let arrayEjemplo = ejemplo.split("");
    registro.appendChild(crearMensajeRegistro("arrayEjemplo[]", arrayEjemplo));

    arrayEjemplo.reverse();
    registro.appendChild(crearMensajeRegistro("arrayEjemplo[]", arrayEjemplo));
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