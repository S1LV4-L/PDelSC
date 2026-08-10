export function Mostrar() {
  return (
    <div className="main-container">
      <header className="header">
        <h1 className="titulo-principal titulo-gradiente">Hola Mundo</h1>
      </header>

      {/* Ejemplos de texto del código original */}
      <section className="seccion-texto">
        <p className="uno">Texto Azul</p>
        <p className="dos">Texto Subrayado con Sombra</p>
        <p className="tres">Texto con Fuente Serif</p>
      </section>

      {/* Sección de Tarjetas con efectos ÚNICOS */}
      <section className="tarjetas-container">
        {/* Tarjeta 1: Efecto de Elevación y Brillo (Shadow & Lift) */}
        <div className="card card-lift">
          <div className="icon">🚀</div>
          <h3>Tarjeta Elevación</h3>
          <p>Sube y proyecta una sombra suave al pasar el cursor.</p>
        </div>

        {/* Tarjeta 2: Fondo con Gradiente Animado (Animated Gradient) */}
        <div className="card card-gradient">
          <div className="icon">🎨</div>
          <h3>Fondo Animado</h3>
          <p>El gradiente del fondo se mueve suavemente.</p>
        </div>

        {/* Tarjeta 3: Transformación 3D y Rotación (3D Flip) */}
        <div className="card card-3d">
          <div className="icon">🌀</div>
          <h3>Rotación 3D</h3>
          <p>Gira ligeramente en 3D para un efecto de profundidad.</p>
        </div>
      </section>
    </div>
  );
}