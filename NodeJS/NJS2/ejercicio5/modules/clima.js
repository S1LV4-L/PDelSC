const dias = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
const emojis = { Soleado: "☀️", Nublado: "☁️", Lluvioso: "🌧", Tormenta: "⛈", Ventoso: "💨" };

export function mostrarClima() {
    const estados = ["Soleado", "Nublado", "Lluvioso", "Tormenta", "Ventoso"];

    // Selecciona un estado al azar del array
    const estado = estados[Math.floor(Math.random() * estados.length)];

    return {
        temperatura: Math.floor(Math.random() * 15 + 15) + "°C",  // Entre 15°C y 29°C
        presion: Math.floor(Math.random() * 20 + 1000) + " hPa",  // Entre 1000 y 1019 hPa
        humedad: Math.floor(Math.random() * 50 + 30) + "%",        // Entre 30% y 79%
        estado
    };
}

export function crearPronostico() {
    return dias.map(dia => {
        const clima = mostrarClima();
        const tempNum = parseInt(clima.temperatura);

        // La temperatura mínima es entre 3°C y 10°C menor que la máxima
        const minTemp = (tempNum - Math.floor(Math.random() * 8 + 3)) + "°C";

        // Retorna el HTML de una tarjeta Bootstrap por cada día
        return `
        <div class="col-md-3 col-sm-6">
            <div class="card text-center">
                <div class="card-header">${dia}</div>
                <div class="card-body">
                    <h5 class="card-title">${emojis[clima.estado]} ${clima.estado}</h5>
                    <p class="card-text">Máx: ${clima.temperatura} — Mín: ${minTemp}</p>
                </div>
                <div class="card-footer text-body-secondary">
                    💧 ${clima.humedad} &nbsp;&nbsp; 🔵 ${clima.presion}
                </div>
            </div>
        </div>`;
    }).join(""); // Une todas las tarjetas en un solo string de HTML
}

export function mostrarDatosExtra() {
    const direcciones = ["N", "NE", "E", "SE", "S", "SO", "O", "NO"];

    return {
        uv: Math.floor(Math.random() * 11),                                              // Índice UV entre 0 y 11
        vientoVelocidad: Math.floor(Math.random() * 60) + " km/h",                      // Entre 0 y 59 km/h
        vientoDireccion: direcciones[Math.floor(Math.random() * direcciones.length)],   // Dirección al azar
        sensacionTermica: Math.floor(Math.random() * 15 + 10) + "°C",                   // Entre 10°C y 24°C
        visibilidad: Math.floor(Math.random() * 20 + 1) + " km",                        // Entre 1 y 20 km
        nubosidad: Math.floor(Math.random() * 101) + "%",                               // Entre 0% y 100%
    };
}