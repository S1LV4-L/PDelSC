document.getElementById("btn1").addEventListener("mouseover", () => {
    window.location.href = "/pages/pagina2.html";
});

const btn2 = document.getElementById("btn2");
const img = document.getElementById("imagen");
const url = "https://png.pngtree.com/png-vector/20230923/ourlarge/pngtree-example-document-illustrative-model-png-image_10125820.png";

btn2.addEventListener("dblclick", () => {
    img.src = img.src.includes("pngtree") ? "" : url;
});

const btn3 = document.getElementById("btn3");

btn3.addEventListener("mouseout", () => {
    document.body.style.backgroundColor = "lightblue";
});
btn3.addEventListener("mouseenter", () => {
    document.body.style.backgroundColor = "lightsteelblue";
});

const btn4 = document.getElementById("btn4");

btn4.addEventListener("mouseenter", () => {
    document.body.style.backgroundColor = "lightcoral";
});
btn4.addEventListener("mouseleave", () => {
    document.body.style.backgroundColor = "lightsteelblue";
});

const btn5 = document.getElementById("btn5");
const texto = document.getElementById("texto");

btn5.addEventListener("mousedown", () => {
    texto.textContent = "Botón presionado";
});
btn5.addEventListener("mouseup", () => {
    texto.textContent = "";
});