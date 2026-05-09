// Btn 1: Muestra todos los nombres de un array con un saludo.
document.getElementById("btn1").addEventListener("dblclick", () => {
    const registro = document.getElementById("registro");

    let nombres = ["Ana", "Carlos", "María", "Juan", "Lucía"];
    registro.appendChild(crearMensajeRegistro("nombres[]", nombres));

    nombres.forEach(nombre => {
        registro.appendChild(crearMensajeRegistro("Hola", nombre));
    });

}, { once: true });


// Btn 2: Imprime el doble de cada número de un array con forEach()
const btn2 = document.getElementById("btn2");
btn2.addEventListener("mouseover", () => {
    const registro = document.getElementById("registro");

    let numeros = [5, 10, 15, 20, 25];
    registro.appendChild(crearMensajeRegistro("numeros[]", numeros));

    numeros.forEach(numero => {
        registro.appendChild(crearMensajeRegistro(`Doble de ${numero}`, numero * 2));
    });

}, { once: true });


// Btn 3: Dado un array de objetos {nombre, edad}, muestra cada nombre con su edad.
const btn3 = document.getElementById("btn3");
btn3.addEventListener("contextmenu", () => {
    const registro = document.getElementById("registro");

    let personas = [
        { nombre: "Ana", edad: 28 },
        { nombre: "Carlos", edad: 34 },
        { nombre: "María", edad: 22 },
        { nombre: "Juan", edad: 45 }
    ];

    personas.forEach(persona => {
        registro.appendChild(crearMensajeRegistro(persona.nombre, `${persona.edad} años`));
    });

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