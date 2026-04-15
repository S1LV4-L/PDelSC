export function crearMenu() {
  return `
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark fixed-top">
      <div class="container-fluid">
        <a class="navbar-brand" href="#">Titulo</a>
        <button class="navbar-toggler" data-bs-toggle="collapse" data-bs-target="#menuNav">
          ☰
        </button>
        <div class="collapse navbar-collapse" id="menuNav">
          <ul class="navbar-nav">
            <li class="nav-item"><a class="nav-link" href="#">Inicio</a></li>
            <li class="nav-item"><a class="nav-link" href="#">Contacto</a></li>
          </ul>
        </div>
      </div>
    </nav>
  `;
}