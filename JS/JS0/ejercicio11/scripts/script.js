// Btn 1: Filtra los números mayores a 10 de un array.
document.getElementById("btn1").addEventListener("dblclick", () => {
    const registro = document.getElementById("registro");

    let numeros = [1, 22, 3, 44, 5, 66];
    registro.appendChild(crearMensajeRegistro("numeros[]", numeros));

    let filtrados = numeros.filter(num => num>10)
    registro.appendChild(crearMensajeRegistro("Numeros mayores a 10", filtrados));
}, { once: true });


// Btn 2: Dado un array de palabras, filtra las que tengan más de 5 letras.
const btn2 = document.getElementById("btn2");
btn2.addEventListener("mouseover", () => {
    const registro = document.getElementById("registro");

    let palabras = ["camión", "auto", "motocicleta", "aeronave", "barco"];
    registro.appendChild(crearMensajeRegistro("palabras[]", palabras));

    let palabrasFiltradas = palabras.filter(palabra => palabra.length > 5);
    registro.appendChild(crearMensajeRegistro("Palabras con más de 5 letras", palabrasFiltradas));
}, { once: true });


// Btn 3: Filtra los usuarios activos de un array de objetos {nombre, activo}.
const btn3 = document.getElementById("btn3");
btn3.addEventListener("contextmenu", () => {
    const registro = document.getElementById("registro");

    let usuarios = [
        { nombre: "Ana", estado: "activo" },
        { nombre: "Carlos", estado: "inactivo" },
        { nombre: "María", estado: "activo" },
        { nombre: "Juan", estado: "inactivo" }
    ];
    registro.appendChild(crearMensajeRegistro("usuarios[]", usuarios.map(u => `${u.nombre} (${u.estado})`)));

    let usuariosActivos = usuarios.filter(usuario => usuario.estado === "activo");
    registro.appendChild(crearMensajeRegistro("usuarios activos", usuariosActivos.map(u => `${u.nombre} (${u.estado})`)));
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