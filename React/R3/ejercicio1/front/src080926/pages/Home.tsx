// Página pública de inicio (ruta "/").
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/Home.css";
import "../styles/estilos.css";
import { ThemeToggle } from "../components/BotonTema";
import { BotonScrollTop } from "../components/BotonScrollTop";

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

export default function Home() {
    const { usuario, logout } = useAuth();
    const navigate = useNavigate();

    // Cierra la sesión y vuelve a Home (que sigue siendo accesible sin login)
    const handleLogout = () => {
        logout();
        navigate("/");
    };

    return (
        <div>
            <ThemeToggle />
            <header className="home-header">
                <h1>Bienvenido</h1>
                {usuario ? (
                    <div>
                        <Link className="btn-link" to="/galeria">Ir a la Galeria</Link>
                        {/* Solo Administrador ve el acceso al sistema de gestión de usuarios */}
                        {usuario.perfil.nombre === "Administrador" && (
                            <Link className="btn-link" to="/usuarios">Ir al sistema</Link>
                        )}
                        <Link className="btn-link" to="/mi-cuenta">Mi cuenta</Link>
                        <button onClick={handleLogout} className="btn-link">Cerrar sesión</button>
                    </div>
                ) : (
                    <div>
                        <Link className="btn-link" to="/galeria">Ir a la Galería</Link>
                        <Link className="btn-link" to="/login">Iniciar sesión</Link>
                        <Link className="btn-link" to="/registro">Crear cuenta</Link>
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