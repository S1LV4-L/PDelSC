// Página pública de inicio
import { useAuth } from "../context/AuthContext";
import "../styles/Home.css";
import "../styles/estilos.css";
import { ThemeToggle } from "../components/BotonTema";
import { BotonScrollTop } from "../components/BotonScrollTop";
import type { NavegacionProps } from "../types";

const imagenes: string[] = [
    "https://picsum.photos/id/10/400/300",
    "https://picsum.photos/id/20/400/300",
    "https://picsum.photos/id/30/400/300",
    "https://picsum.photos/id/40/400/300",
    "https://picsum.photos/id/50/400/300",
    "https://picsum.photos/id/60/400/300",
    "https://picsum.photos/id/70/400/300",
    "https://picsum.photos/id/80/400/300",
    "https://picsum.photos/id/90/400/300",
    "https://picsum.photos/id/100/400/300",
    "https://picsum.photos/id/110/400/300",
    "https://picsum.photos/id/120/400/300",
    "https://picsum.photos/id/130/400/300",
    "https://picsum.photos/id/140/400/300",
    "https://picsum.photos/id/160/400/300",
    "https://picsum.photos/id/170/400/300",
    "https://picsum.photos/id/180/400/300",
    "https://picsum.photos/id/190/400/300"
];

// setPagina actualiza el estado que vive en App.tsx.
export default function Home({ setPagina }: NavegacionProps) {
    const { usuario, logout } = useAuth();

    // Cierra la sesión y vuelve a Home (que sigue siendo accesible sin login)
    const handleLogout = () => {
        logout();
        setPagina("home");
    };

    return (
        <div>
            <ThemeToggle />
            <header className="home-header">
                <h1>Bienvenido</h1>
                {usuario ? (
                    <div>
                        {/* Botones que disparan setPagina */}
                        <button className="btn-link" onClick={() => setPagina("galeria")}>Ir a la Galeria</button>
                        {/* Solo Administrador ve el acceso al sistema de gestión de usuarios */}
                        {usuario.perfil.nombre === "Administrador" && (
                            <button className="btn-link" onClick={() => setPagina("usuarios")}>Ir al sistema</button>
                        )}
                        <button className="btn-link" onClick={() => setPagina("mi-cuenta")}>Mi cuenta</button>
                        <button onClick={handleLogout} className="btn-link">Cerrar sesión</button>
                    </div>
                ) : (
                    <div>
                        <button className="btn-link" onClick={() => setPagina("galeria")}>Ir a la Galería</button>
                        <button className="btn-link" onClick={() => setPagina("login")}>Iniciar sesión</button>
                        <button className="btn-link" onClick={() => setPagina("registro")}>Crear cuenta</button>
                    </div>
                )}
            </header>

            <div className="home-imagenes">
                {imagenes.map((url) => (
                    <img key={url} src={url} alt="Imagen de portada" />
                ))}
            </div>
            <BotonScrollTop/>
        </div>
    );
}