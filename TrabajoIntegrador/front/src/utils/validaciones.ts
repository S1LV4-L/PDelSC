// Funciones de validación reutilizables.
// Cada campo, incluida la validación de vacío, se controla mediante "validate".
// Cada función devuelve "true" si es válido, o el mensaje de error si no.
export const validarNombre = {
    noVacio: (valor: string) => valor.trim().length > 0 || "El nombre no puede estar vacío",
    soloLetrasYNumeros: (valor: string) =>
        /^[a-zA-ZÀ-ÿ0-9 ]+$/.test(valor) || "El nombre solo puede contener letras y números",
    noSoloNumeros: (valor: string) =>
        !/^[0-9\s]+$/.test(valor) || "El nombre no puede contener únicamente números",
    minLetras: (valor: string) =>
        (valor.match(/[a-zA-ZÀ-ÿ]/g)?.length ?? 0) >= 3 ||
        "El nombre debe contener al menos tres letras",
    maxLength: (valor: string) =>
        valor.length <= 50 || "El nombre no puede tener más de 50 caracteres",
    sinEspaciosDobles: (valor: string) =>
        !/\s{2,}/.test(valor) || "El nombre no puede contener dos o más espacios juntos",
};

export const validarPassword = {
    noVacio: (valor: string) => valor.length > 0 || "La contraseña no puede estar vacía",
    soloLetrasYNumeros: (valor: string) =>
        /^[a-zA-Z0-9]+$/.test(valor) || "La contraseña solo puede contener letras y números",
    minLength: (valor: string) =>
        valor.length >= 8 || "La contraseña debe tener al menos 8 caracteres",
    noSoloNumeros: (valor: string) =>
        !/^[0-9]+$/.test(valor) || "La contraseña no puede contener únicamente números",
    sinEspacios: (valor: string) => !/\s/.test(valor) || "La contraseña no puede contener espacios",
    maxLength: (valor: string) =>
        valor.length <= 120 || "La contraseña no puede tener más de 120 caracteres",
};

export const validarEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
// Versión opcional de validarPassword: si el campo está vacío, se considera válido (el usuario no cambió la contraseña).
// Si escribió algo, se aplican las mismas reglas que en el registro.
export const validarPasswordOpcional = {
    soloLetrasYNumeros: (valor: string) =>
        valor.length === 0 || /^[a-zA-Z0-9]+$/.test(valor) ||
        "La contraseña solo puede contener letras y números",
    minLength: (valor: string) =>
        valor.length === 0 || valor.length >= 8 || "La contraseña debe tener al menos 8 caracteres",
    noSoloNumeros: (valor: string) =>
        valor.length === 0 || !/^[0-9]+$/.test(valor) ||
        "La contraseña no puede contener únicamente números",
    sinEspacios: (valor: string) =>
        valor.length === 0 || !/\s/.test(valor) || "La contraseña no puede contener espacios",
    maxLength: (valor: string) =>
        valor.length === 0 || valor.length <= 120 ||
        "La contraseña no puede tener más de 120 caracteres",
};

// Texto libre que admite letras (con tildes, ñ y ü), puntos y comas, separadas por espacios simples
const LETRAS = "A-Za-zÁÉÍÓÚÜÑáéíóúüñ";
const PUNTUACION = ".,";
export const soloLetras = (valor: string) =>
    valor.replace(new RegExp(`[^${LETRAS}${PUNTUACION} ]`, "g"), "").replace(/ {2,}/g, " ");
const contarLetras = (valor: string) => valor.match(new RegExp(`[${LETRAS}]`, "g"))?.length ?? 0;
const reglasTexto = (etiqueta: string, minLetras: number, max: number) => ({
    soloLetras: (v: string) =>
        v.length === 0 || new RegExp(`^[${LETRAS}${PUNTUACION} ]+$`).test(v) ||
        `${etiqueta} solo puede contener letras, puntos y comas`,
    sinEspaciosDobles: (v: string) =>
        !/\s{2,}/.test(v) || `${etiqueta} no puede contener dos o más espacios juntos`,
    minLetras: (v: string) =>
        contarLetras(v) >= minLetras || `${etiqueta} debe tener al menos ${minLetras} letras`,
    maxLength: (v: string) => v.trim().length <= max || `${etiqueta} no puede tener más de ${max} caracteres`,
});

type Validador = (valor: string) => string | null;

// Convierte tu objeto de reglas en una sola funcion: devuelve el primer error o null
export const combinar =
    (reglas: Record<string, (valor: string) => string | boolean>): Validador =>
    (valor) => {
        for (const regla of Object.values(reglas)) {
            const resultado = regla(valor);
            if (resultado !== true) return String(resultado);
        }
        return null;
    };

// Validadores listos para pasar como prop "validate"
export const validar = {
    nombre: combinar(validarNombre),
    email: ((valor) => {
        if (valor.trim().length === 0) return "El email no puede estar vacío";
        return validarEmail(valor) ? null : "El email no es válido";
    }) as Validador,
    password: combinar(validarPassword),
    passwordLogin: combinar({ noVacio: validarPassword.noVacio }),
    passwordOpcional: combinar(validarPasswordOpcional),
    coincide:
        (original: string): Validador =>
        (valor) =>
            valor === original ? null : "Las contraseñas no coinciden",
    // Motivo de una justificación: obligatorio, solo letras, 5 a 500 caracteres
    motivo: ((valor) => combinar(reglasTexto("El motivo", 5, 500))(valor.trim())) as Validador,
    // Nota breve de una ausencia: opcional, solo letras, hasta 255 caracteres
    notaAusencia: ((valor) =>
        valor.trim().length === 0 ? null : combinar(reglasTexto("La nota", 1, 255))(valor.trim())) as Validador,
    codigoRecuperacion: ((valor) => /^[A-Za-z0-9]{5}-?[A-Za-z0-9]{5}$/.test(valor.trim()) ? null 
        : "El código tiene el formato ABCDE-FGHJK") as Validador,
};