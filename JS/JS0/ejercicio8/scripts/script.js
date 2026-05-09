// Btn 1: Comprueba si un array contiene la palabra "admin".
document.getElementById("btn1").addEventListener("dblclick", () => {
    const registro = document.getElementById("registro");

    let usuarios = ["user1", "user2", "user3", "user4", "admin"];
    registro.appendChild(crearMensajeRegistro("usuarios[]", usuarios));

    let buscar = "admin";

    usuarios.includes(buscar) ?
    registro.appendChild(crearMensajeRegistro("usuarios[] si contiene la palabra", buscar)) :
    registro.appendChild(crearMensajeRegistro("usuarios[] no contiene la palabra", buscar));

}, { once: true });


// Btn 2: Dado un array de colores, indica si existe "verde".
const btn2 = document.getElementById("btn2");
btn2.addEventListener("mouseover", () => {
    const registro = document.getElementById("registro");

    let colores = ["rojo", "azul", "naranja", "blanco"];
    registro.appendChild(crearMensajeRegistro("colores[]", colores));

    let buscar = "verde";

    colores.includes(buscar) ?
    registro.appendChild(crearMensajeRegistro("En colores[] si existe la palabra", buscar)) :
    registro.appendChild(crearMensajeRegistro("En colores[] no existe la palabra", buscar));
}, { once: true });


// Btn 3: Verifica si un número está presente antes de sumarlo al array.
const btn3 = document.getElementById("btn3");
btn3.addEventListener("contextmenu", () => {
    const registro = document.getElementById("registro");

    let numeros = [10, 20, 30];
    let nuevo = 40;

    registro.appendChild(crearMensajeRegistro("numeros[]", numeros));

    if (!numeros.includes(nuevo)) {
        numeros.push(nuevo);
        registro.appendChild(crearMensajeRegistro("El numero fue agregado correctamente a numeros[]", numeros));
    }
    else{
        registro.appendChild(crearMensajeRegistro("En numeros[] ya existe el numero", numeros));
    }
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