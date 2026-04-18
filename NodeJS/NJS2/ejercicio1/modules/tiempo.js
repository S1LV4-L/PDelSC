export function mostrarClima() {
    const estados = ["Soleado", "Nublado", "Lluvioso", "Tormenta", "Ventoso"];
    const estadoAleatorio = estados[Math.floor(Math.random() * estados.length)];
    // el indice que se selecciona del array es un numero aleatorio, math.floor lo redondea hacia abajo para que sea valido. Math.random va de 0 a 1

    return {
        temperatura: Math.floor(Math.random() * 15 + 15) + "°C",
        presion: Math.floor(Math.random() * 20 + 1000) + " hPa",
        humedad: Math.floor(Math.random() * 50 + 30) + "%",
        estado: estadoAleatorio
    };
}