// Verifica si el usuario se desplaza en la página
document.addEventListener('scroll', () => {

    // Cantidad de píxeles que se desplazó la página hacia abajo
    const scrollTop = window.scrollY;

    // Altura total desplazable de la página = (altura total del documento - altura visible de la ventana)
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;

    // Calcula el porcentaje de scroll realizado en un rango de 0-100
    const progress = (scrollTop / totalHeight) * 100;

    // Actualiza el valor de la barra de progreso
    document.getElementById('pageProgress').value = progress;
});

// Espera a que el DOM esté completamente cargado antes de ejecutar adjustCotizaciones
document.addEventListener('DOMContentLoaded', () => {
    adjustCotizaciones();
    window.addEventListener('resize', adjustCotizaciones);
});

function adjustCotizaciones() {
    const headerHeight = document.getElementById('header').offsetHeight; // Obtiene la altura real del header en px según la resolución actual

    document.getElementById('cotizaciones').style.marginTop = (headerHeight+10) + 'px'; // Aplica esa altura como margin-top + 10px extra
}