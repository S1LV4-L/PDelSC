// Btn 1: Crea un array vacío y agrega tres frutas usando push().
document.getElementById("btn1").addEventListener("dblclick", () => {
    const registro = document.getElementById("registro");

    let frutas = [];
    frutas.push("Manzana", "Naranja", "Pera");

    registro.appendChild(crearMensajeRegistro("frutas", frutas));
}, { once: true }); //se ejecuta solo una vez

let amigos = [];


// Btn 2: Agrega los nombres de tus 3 amigos a un array existente llamado amigos.
const btn2 = document.getElementById("btn2");
btn2.addEventListener("mouseover", () => {
    const registro = document.getElementById("registro");

    amigos.push("Juan", "Marcos", "Pedro");

    registro.appendChild(crearMensajeRegistro("amigos", amigos));
}, { once: true });

let numeros = [3, 6, 8];


// Btn 3: Dado un array de números, agrega un nuevo número solo si es mayor que el último número.
const btn3 = document.getElementById("btn3");
btn3.addEventListener("contextmenu", () => {
    let num1 = 1, num2 = 10;
    let ultimo = numeros[numeros.length - 1];

    if (num1 > ultimo) numeros.push(num1);
    else if(num2 > ultimo) numeros.push(num2)
    
    registro.appendChild(crearMensajeRegistro("numeros", numeros));
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