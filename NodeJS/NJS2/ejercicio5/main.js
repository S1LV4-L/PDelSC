import { crearMenu } from "./modules/menu.js";
import { mostrarClima, crearPronostico, mostrarDatosExtra } from "./modules/clima.js";

function descripcionUV(uv) {
    if (uv <= 2) return "Bajo";
    if (uv <= 5) return "Moderado";
    if (uv <= 7) return "Alto";
    if (uv <= 10) return "Muy alto";
    return "Extremo";
}

export function cargarInicio(data) {
    const clima = mostrarClima();
    data = data.replace('<div id="menu"></div>', crearMenu());
    data = data.replace("{{estado}}", clima.estado);
    data = data.replace("{{temperatura}}", clima.temperatura);
    data = data.replace("{{humedad}}", clima.humedad);
    data = data.replace("{{presion}}", clima.presion);

    // Reemplaza el placeholder del emoji según el estado del clima
    switch (clima.estado) {
        case "Soleado": data = data.replace("{{emoji_estado}}", "☀️"); break;
        case "Nublado": data = data.replace("{{emoji_estado}}", "☁️"); break;
        case "Lluvioso": data = data.replace("{{emoji_estado}}", "🌧"); break;
        case "Tormenta": data = data.replace("{{emoji_estado}}", "⛈"); break;
        case "Ventoso": data = data.replace("{{emoji_estado}}", "💨"); break;
    }

    return data;
}

export function cargarPronostico(data) {
    data = data.replace('<div id="menu"></div>', crearMenu());
    data = data.replace("{{pronostico}}", crearPronostico());
    return data;
}

export function cargarMapa(data) {
    data = data.replace('<div id="menu"></div>', crearMenu());
    return data;
}

export function cargarRadar(data) {
    data = data.replace('<div id="menu"></div>', crearMenu());
    return data;
}

export function cargarAcercaDe(data) {
    data = data.replace('<div id="menu"></div>', crearMenu());
    return data;
}

export function cargarDatosExtra(data) {
    const extra = mostrarDatosExtra();
    data = data.replace('<div id="menu"></div>', crearMenu());
    data = data.replace("{{uv}}", extra.uv);
    data = data.replace("{{uv_descripcion}}", descripcionUV(extra.uv));
    data = data.replace("{{viento_velocidad}}", extra.vientoVelocidad);
    data = data.replace("{{viento_direccion}}", extra.vientoDireccion);
    data = data.replace("{{sensacion_termica}}", extra.sensacionTermica);
    data = data.replace("{{visibilidad}}", extra.visibilidad);
    data = data.replace("{{nubosidad}}", extra.nubosidad);
    return data;
}