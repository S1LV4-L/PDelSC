// Guarda en un solo estado cuál es la "página" visible y renderiza el componente correspondiente
// aplicando antes la protección de páginas que requieren sesión.
import { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { paginaProtegida } from "./components/PaginaProtegida";
import type { Pagina } from "./types";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Registro from "./pages/Registro";
import OlvidePassword from "./pages/OlvidePassword";
import MiCuenta from "./pages/MiCuenta";
import UsuariosLista from "./pages/UsuariosLista";
import Galeria from "./pages/Galeria";

// componente interno que useAuth() necesita. Se ejecuta DENTRO de <AuthProvider>, y App() provee el contexto.
function Navegador() {
    // Único estado de navegación de toda la app: reemplaza a la URL del navegador.
    const [pagina, setPagina] = useState<Pagina>("home");
    const { usuario } = useAuth();

    // Si la página pedida requiere sesión y no hay usuario logueado, se muestra login en su lugar
    const paginaAMostrar = paginaProtegida(pagina, usuario);

    // Cada página recibe setPagina para poder navegar a otra.
    switch (paginaAMostrar) {
        case "login":
            return <Login setPagina={setPagina} />;
        case "registro":
            return <Registro setPagina={setPagina} />;
        case "olvide-password":
            return <OlvidePassword setPagina={setPagina} />;
        case "mi-cuenta":
            return <MiCuenta setPagina={setPagina} />;
        case "usuarios":
            return <UsuariosLista setPagina={setPagina} />;
        case "galeria":
            return <Galeria setPagina={setPagina} />;
        case "home":
        default:
            return <Home setPagina={setPagina} />;
    }
}

export default function App() {
    return (
        <AuthProvider>
            <Navegador />
        </AuthProvider>
    );
}