export function crearMenu() {
    return `
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark fixed-top">
        <div class="container-fluid">

            <a class="navbar-brand" href="inicio.html">
                <img src="https://uxwing.com/wp-content/themes/uxwing/download/weather/weather-icon.png" alt="Logo" 
                width="30" height="24" class="d-inline-block align-text-top">
                El Clima
            </a>

            <button class="navbar-toggler" data-bs-toggle="collapse" data-bs-target="#menuResponsive">
                <span class="navbar-toggler-icon"></span>
            </button>

            <div class="collapse navbar-collapse" id="menuResponsive">
                <ul class="navbar-nav ms-auto gap-3">
                    <li class="nav-item">
                        <a class="nav-link" href="pronostico.html">Pronóstico</a>
                    </li>

                    <li class="nav-item">
                        <a class="nav-link" href="mapa.html">Mapa</a>
                    </li>

                    <li class="nav-item">
                        <a class="nav-link" href="radar.html">Radar</a>
                    </li>

                    <li class="nav-item">
                        <a class="nav-link" href="datos-extra.html">Datos Extra</a>
                    </li>

                    <li class="nav-item">
                        <a class="nav-link" href="acerca-de.html">Acerca de</a>
                    </li>
                </ul>
            </div>
            
        </div>
    </nav>
  `;
}