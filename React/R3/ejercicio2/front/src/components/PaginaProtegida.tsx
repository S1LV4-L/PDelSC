// useState decide de antemano qué página corresponde mostrar antes de renderizarla
import type { Pagina, Usuario } from "../types";

// Páginas que exigen sesión activa
const PAGINAS_PROTEGIDAS: Pagina[] = ["mi-cuenta", "usuarios", "recetas"];

// Dada la página que se quiere mostrar y el usuario actual, devuelve la página que realmente corresponde renderizar:
// la misma si es pública o si hay sesión, o "login" si es protegida y no hay sesión activa.
export function paginaProtegida(pagina: Pagina, usuario: Usuario | null): Pagina {
    if (PAGINAS_PROTEGIDAS.includes(pagina) && !usuario) return "login";
    return pagina;
}