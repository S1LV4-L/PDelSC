export function crearMenu() {
    return `
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary fixed-top">
        <div class="container-fluid">

            <a class="navbar-brand text-black" href="/">
                <img src="https://uxwing.com/wp-content/themes/uxwing/download/weather/weather-icon.png" alt="Logo" 
                width="30" height="24" class="d-inline-block align-text-top">
                El Clima
            </a>

            <button class="navbar-toggler" data-bs-toggle="collapse" data-bs-target="#menuResponsive">
                <span class="navbar-toggler-icon"></span>
            </button>

            <div class="collapse navbar-collapse" id="menuResponsive">
                <ul class="navbar-nav ms-auto gap-3 align-items-lg-center">
                    <li class="nav-item">
                        <a class="nav-link text-black" href="pronostico.html">Pronóstico</a>
                    </li>

                    <li class="nav-item">
                        <a class="nav-link text-black" href="mapa.html">Mapa</a>
                    </li>

                    <li class="nav-item">
                        <a class="nav-link text-black" href="radar.html">Radar</a>
                    </li>

                    <li class="nav-item">
                        <a class="nav-link text-black" href="datos-extra.html">Datos Extra</a>
                    </li>

                    <li class="nav-item">
                        <a class="nav-link text-black" href="acerca-de.html">Acerca de</a>
                    </li>

                    <li class="nav-item">
                        <button id="btnTema" class="btn btn-outline-light">
                            <span id="btnTemaIcono" class="me-1">🌙</span>
                            <span id="btnTemaTexto" class="d-none d-sm-inline">Modo claro</span>
                        </button>
                    </li>
                </ul>
            </div>
            
        </div>
    </nav>
  `;
}