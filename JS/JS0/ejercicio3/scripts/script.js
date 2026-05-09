// Btn 1: Agrega tres colores al principio de un array vacío.
document.getElementById("btn1").addEventListener("dblclick", () => {
    const registro = document.getElementById("registro");

    let colores = [];
    registro.appendChild(crearMensajeRegistro("colores (antes)", colores));

    colores.unshift("Rojo");
    colores.unshift("Verde");
    colores.unshift("Azul");

    registro.appendChild(crearMensajeRegistro("colores (ahora)", colores));
}, { once: true });


// Btn 2: Dado un array de tareas, agrega una nueva tarea urgente al principio.
const btn2 = document.getElementById("btn2");
btn2.addEventListener("mouseover", () => {
    const registro = document.getElementById("registro");

    let tareas = ["tarea1", "tarea2", "tarea3"];
    registro.appendChild(crearMensajeRegistro("tareas (antes)", tareas));

    tareas.unshift("(urgente) tarea4");

    registro.appendChild(crearMensajeRegistro("tareas (ahora)", tareas));
}, { once: true });


// Btn 3: Inserta el nombre de un usuario al principio de un array de usuarios conectados.
const btn3 = document.getElementById("btn3");
btn3.addEventListener("contextmenu", () => {
    const registro = document.getElementById("registro");

    let usuariosConectados = ["Pedro", "Carlos", "Juan"];
    registro.appendChild(crearMensajeRegistro("usuariosConectados (antes)", usuariosConectados));

    usuariosConectados.unshift("John");

    registro.appendChild(crearMensajeRegistro("usuariosConectados (ahora)", usuariosConectados));
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