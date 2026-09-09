// Página pública de inicio
import { useAuth } from "../context/AuthContext";
import "../styles/Home.css";
import "../styles/estilos.css";
import { ThemeToggle } from "../components/BotonTema";
import { BotonScrollTop } from "../components/BotonScrollTop";
import type { NavegacionProps } from "../types";

const destacadas: { nombre: string; tiempo: string; dificultad: string }[] = [
    { nombre: "Milanesas a la napolitana", tiempo: "40 min", dificultad: "Fácil" },
    { nombre: "Risotto de hongos", tiempo: "45 min", dificultad: "Media" },
    { nombre: "Tacos al pastor", tiempo: "35 min", dificultad: "Media" },
    { nombre: "Ñoquis", tiempo: "55 min", dificultad: "Media" },
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
                        <button className="btn-link" onClick={() => setPagina("recetas")}>Ir a Recetas</button>
                        {/* Solo Administrador ve el acceso al sistema de gestión de usuarios */}
                        {usuario.perfil.nombre === "Administrador" && (
                            <button className="btn-link" onClick={() => setPagina("usuarios")}>Ir al sistema</button>
                        )}
                        <button className="btn-link" onClick={() => setPagina("mi-cuenta")}>Mi cuenta</button>
                        <button onClick={handleLogout} className="btn-link">Cerrar sesión</button>
                    </div>
                ) : (
                    <div>
                        <button className="btn-link" onClick={() => setPagina("recetas")}>Ir a Recetas</button>
                        <button className="btn-link" onClick={() => setPagina("login")}>Iniciar sesión</button>
                        <button className="btn-link" onClick={() => setPagina("registro")}>Crear cuenta</button>
                    </div>
                )}
            </header>

            <div className="home-intro">
                <p className="home-intro-texto">
                    Recetas simples y rápidas para el día a día, pensadas para cocinar sin vueltas.
                </p>

                <h2 className="home-destacadas-titulo">Recetas destacadas</h2>
                <div className="home-destacadas-grid">
                    {destacadas.map((receta) => (
                        <div key={receta.nombre} className="home-destacada-card">
                            <p className="home-destacada-nombre">{receta.nombre}</p>
                            <p className="home-destacada-meta">⏱ {receta.tiempo} · {receta.dificultad}</p>
                        </div>
                    ))}
                </div>

                <button className="btn-link" onClick={() => setPagina("recetas")}>Ver todas las recetas</button>
            </div>
            <BotonScrollTop/>
        </div>
    );
}