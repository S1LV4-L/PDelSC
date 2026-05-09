// Btn 1: Quita el primer número de un array de enteros.
document.getElementById("btn1").addEventListener("dblclick", () => {
    const registro = document.getElementById("registro");

    let numeros = [1, 2, 3, 4, 5, 6];
    registro.appendChild(crearMensajeRegistro("numeros (antes)", numeros));

    numeros.shift();

    registro.appendChild(crearMensajeRegistro("numeros (ahora)", numeros));
}, { once: true });

// Btn 2: Elimina el primer mensaje de un array de mensajes de chat.
const btn2 = document.getElementById("btn2");
btn2.addEventListener("mouseover", () => {
    const registro = document.getElementById("registro");

    let mensajesDelChat = ["Hola", "Como estas?", "Bien"];
    registro.appendChild(crearMensajeRegistro("mensajesDelChat (antes)", mensajesDelChat));

    mensajesDelChat.shift();

    registro.appendChild(crearMensajeRegistro("mensajesDelChat (ahora)", mensajesDelChat));
}, { once: true });


// Btn 2: Usa shift() para simular una cola de atención al cliente.
const btn3 = document.getElementById("btn3");
btn3.addEventListener("contextmenu", () => {
    const registro = document.getElementById("registro");

    let colaClientes = ["Pedro", "Carlos", "Juan"];

    registro.appendChild(
        crearMensajeRegistro("colaClientes (antes)", colaClientes)
    );

    let atendido = colaClientes.shift();

    registro.appendChild(
        crearMensajeRegistro("Cliente atendido", atendido)
    );

    registro.appendChild(
        crearMensajeRegistro("colaClientes (ahora)", colaClientes)
    );
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