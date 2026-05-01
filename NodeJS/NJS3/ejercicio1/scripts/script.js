document.getElementById("btn1").addEventListener("click", () => {
    document.getElementById("texto").textContent = "Hola DOM";
});

document.getElementById("btn2").addEventListener("click", () => {
    const texto = document.getElementById("texto");
    texto.textContent = texto.textContent.replace("Hola DOM", "Chau DOM");
});

document.getElementById("btn3").addEventListener("click", () => {
    const texto = document.getElementById("texto");
    if (texto.style.color === "red") {
        texto.style.color = "black";
    } else {
        texto.style.color = "red";
    }
});

document.getElementById("btn4").addEventListener("click", () => {
    document.getElementById("imagen").src =
        "https://thumbs.dreamstime.com/b/sello-del-ejemplo-28420393.jpg";
});

document.getElementById("btn5").addEventListener("click", () => {
    const img = document.getElementById("imagen");

    if (img.src.includes("dreamstime")) {
        img.src = "https://png.pngtree.com/png-vector/20230923/ourlarge/pngtree-example-document-illustrative-model-png-image_10125820.png";
    }
    else if(img.src.includes("pngtree")) {
        img.src = "https://thumbs.dreamstime.com/b/sello-del-ejemplo-28420393.jpg";
    }
});

document.getElementById("btn6").addEventListener("click", () => {
    const img = document.getElementById("imagen");

    if (img.className.includes("w-50")) {
        img.className = img.className.replace("w-50", "w-25");
    } else {
        img.className = img.className.replace("w-25", "w-50");
    }
});

document.getElementById("btn7").addEventListener("click", () => {
    window.location.reload();
});