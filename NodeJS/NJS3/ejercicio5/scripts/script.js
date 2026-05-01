document.getElementById("btn1").addEventListener("click", () => {
    const contenedor = document.getElementById("contenedor");
    const existe = document.getElementById("parrafo1");

    if (existe) existe.remove();
    else {
        contenedor.innerHTML += `
            <p id="parrafo1" class="font-monospace mb-2">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
            </p>
        `;
    }
});

const btn2 = document.getElementById("btn2");
btn2.addEventListener("click", () => {
    const contenedor = document.getElementById("contenedor");
    const existe = document.getElementById("imagen1");

    if (existe) existe.remove();
    else {
        contenedor.innerHTML += `
            <img id="imagen1" src="https://cdn-images.dzcdn.net/images/cover/9b688305dbe0c717209128533dee4ca7/500x500-000000-80-0-0.jpg" class="img-fluid rounded mb-2" alt="imagen">
        `;
    }
});

const btn3 = document.getElementById("btn3");
btn3.addEventListener("click", () => {
    const contenedor = document.getElementById("contenedor");
    const existe = document.getElementById("lista1");

    if (existe) existe.remove();
    else {
        contenedor.innerHTML += `
            <ul id="lista1" class="list-group mb-2">
                <div class="list-group-item list-group-item-dark fw-bold">Lista</div>
                <li class="list-group-item">Elemento uno</li>
                <li class="list-group-item">Elemento dos</li>
                <li class="list-group-item">Elemento tres</li>
                <li class="list-group-item">Elemento cuatro</li>
            </ul>
        `;
    }
});

const btn4 = document.getElementById("btn4");

btn4.addEventListener("click", () => {
    const contenedor = document.getElementById("contenedor");
    const existe = document.getElementById("tabla1");

    if (existe) existe.remove();
    else {
        contenedor.innerHTML += `
            <div id="tabla1" class="table-responsive">
                <table class="table table-bordered mb-2">
                    <thead>
                        <tr>
                            <th style="background-color: black; color: white;">#</th>
                            <th style="background-color: black; color: white;">Equipo</th>
                            <th style="background-color: black; color: white;">IP</th>
                            <th style="background-color: black; color: white;">Estado</th>
                        </tr>
                    </thead>
                    
                    <tbody>
                        <tr>
                            <th>1</th>
                            <td>PC-01</td>
                            <td>192.168.0.10</td>
                            <td class="text-success">Activo</td>
                        </tr>
                        <tr>
                            <th>2</th>
                            <td>Servidor</td>
                            <td>192.168.0.1</td>
                            <td class="text-success">Activo</td>
                        </tr>
                        <tr>
                            <th>3</th>
                            <td>Impresora</td>
                            <td>192.168.0.50</td>
                            <td class="text-danger">Inactivo</td>
                        </tr>
                        <tr>
                            <th>4</th>
                            <td>Notebook</td>
                            <td>192.168.0.25</td>
                            <td class="text-warning">Intermitente</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;
    }
});

const btn5 = document.getElementById("btn5");
btn5.addEventListener("click", () => {
    const contenedor = document.getElementById("contenedor");
    const existe = document.getElementById("enlace1");

    if (existe) existe.remove();
    else {
        contenedor.innerHTML += `
            <a id="enlace1" href="https://getbootstrap.com/" target="_blank"
            class="d-block mb-2 link-primary link-offset-2 link-underline-opacity-25 link-underline-opacity-100-hover">
                Link a Bootstrap
            </a>
        `;
    }
});