// Página del Portfolio.
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Fade } from "react-awesome-reveal";
import { useAuth } from "../context/AuthContext";
import { usePortfolio } from "../context/PortfolioContext";
import "../styles/PortfolioPage.css";
import "../styles/estilos.css";
import { ThemeToggle } from "../components/BotonTema";
import { BotonScrollTop } from "../components/BotonScrollTop";
import { Icono } from "../components/Icono";

// Scroll suave hacia una sección por id
const irA = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

export default function PortfolioPage() {
    const { esAdmin, logout } = useAuth();
    const { data, cargando } = usePortfolio();
    const navigate = useNavigate();

    const [menuAbierto, setMenuAbierto] = useState(false);
    const headerRef = useRef<HTMLElement>(null);

    // Cierra el menú con Escape, al hacer click fuera del header
    // o al pasar a resolución desktop. Los hooks van antes del return condicional.
    useEffect(() => {
        if (!menuAbierto) return;

        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setMenuAbierto(false);
        };
        const onClickFuera = (e: MouseEvent) => {
            if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
                setMenuAbierto(false);
            }
        };
        const mq = window.matchMedia("(min-width: 769px)");
        const onCambioTamano = () => {
            if (mq.matches) setMenuAbierto(false);
        };

        document.addEventListener("keydown", onKey);
        document.addEventListener("mousedown", onClickFuera);
        mq.addEventListener("change", onCambioTamano);

        return () => {
            document.removeEventListener("keydown", onKey);
            document.removeEventListener("mousedown", onClickFuera);
            mq.removeEventListener("change", onCambioTamano);
        };
    }, [menuAbierto]);

    // Cierra el menú y hace scroll a la sección
    const irASeccion = (id: string) => {
        setMenuAbierto(false);
        irA(id);
    };

    // Cierra la sesión y vuelve a Home (que sigue siendo accesible sin login)
    const handleLogout = () => {
        setMenuAbierto(false);
        logout();
        navigate("/");
    };

    // Evita mostrar un instante los valores por defecto
    if (cargando) return null;

    const { nombre, icono: iconoHeader, sobreMi, categorias, proyectos, contacto } = data;

    return (
        <div className="portfolio-background">
            <header className="portfolio-header" ref={headerRef}>
                {(iconoHeader || nombre) && (
                    <div className="header-marca">
                        {iconoHeader && <Icono className="header-icono" src={iconoHeader} monocromo />}
                        {nombre && <h1>{nombre}</h1>}
                    </div>
                )}

                <div className="header-derecha">
                    <nav
                        id="menu-principal"
                        className={`header-botones${menuAbierto ? " abierto" : ""}`}
                    >
                        <button className="btn-link btn-sobre-mi" onClick={() => irASeccion("home")}>Home</button>
                        <button className="btn-link btn-skills" onClick={() => irASeccion("skills")}>Skills</button>
                        <button className="btn-link btn-proyectos" onClick={() => irASeccion("proyectos")}>Proyectos</button>
                        <button className="btn-link btn-contacto" onClick={() => irASeccion("contacto")}>Contacto</button>
                        {esAdmin && (
                            <div className="admin-botones">
                                <Link className="btn-link" to="/dev" onClick={() => setMenuAbierto(false)}>Dev</Link>
                                <button className="btn-link" onClick={handleLogout}>Cerrar sesión</button>
                            </div>
                        )}
                    </nav>

                    <ThemeToggle />

                    <button
                        type="button"
                        className={`hamburguesa${menuAbierto ? " abierto" : ""}`}
                        aria-label={menuAbierto ? "Cerrar menú" : "Abrir menú"}
                        aria-expanded={menuAbierto}
                        aria-controls="menu-principal"
                        onClick={() => setMenuAbierto((v) => !v)}
                    >
                        <span />
                        <span />
                        <span />
                    </button>
                </div>
            </header>

            <main className="contenedor-principal">
                <section id="home" className="seccion sobre-mi">
                    <Fade cascade damping={0.15} direction="up" triggerOnce>
                        <h1>{sobreMi.titulo}</h1>
                        <h3>{sobreMi.subtitulo}</h3>
                        <h4>{sobreMi.descripcion}</h4>
                    </Fade>
                </section>

                <section id="skills" className="seccion">
                    <h1 className="title">skills</h1>
                    <div className="skills">
                        {categorias.map((cat, i) => (
                            <Fade key={cat.id} direction="up" delay={i * 100} triggerOnce>
                                <div className="skill-card">
                                    <div className="card-header">
                                        {cat.icono && <Icono className="card-icon" src={cat.icono} />}
                                        <span className="card-title">{cat.titulo}</span>
                                    </div>

                                    <div className="skill-list">
                                        {cat.skills.map((skill) => (
                                            <div className="skill" key={skill.id}>
                                                {skill.icono && (
                                                    <Icono className="skill-icon" src={skill.icono} />
                                                )}
                                                <span className="skill-name">{skill.nombre}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </Fade>
                        ))}
                    </div>
                </section>

                <section id="proyectos" className="seccion">
                    <h1 className="title">proyectos</h1>
                    <div className="proyectos">
                        {proyectos.map((p, i) => (
                            <Fade key={p.id} direction="up" delay={i * 100} triggerOnce>
                                <a href={p.enlace} target="_blank" rel="noreferrer">
                                    {p.imagen ? (
                                        <img className="proyecto-preview" src={p.imagen} alt="Ver proyecto" />
                                    ) : (
                                        <span className="proyecto-sin-imagen">{p.enlace}</span>
                                    )}
                                </a>
                            </Fade>
                        ))}
                    </div>
                </section>

                <section id="contacto" className="seccion">
                    <h1 className="title">contacto</h1>
                    <Fade direction="up" triggerOnce>
                        <div className="contacto">
                            {contacto.email && (
                                <a href={`mailto:${contacto.email}`}>Correo Electrónico</a>
                            )}
                            {contacto.enlaces.map((e) => (
                                <a key={e.id} href={e.url} target="_blank" rel="noreferrer">
                                    {e.texto}
                                </a>
                            ))}
                        </div>
                    </Fade>
                </section>
            </main>

            {/* Acceso discreto al login: solo se muestra si no hay sesión de admin */}
            {!esAdmin && (
                <footer className="portfolio-footer">
                    <Link to="/login" className="login-discreto" aria-label="Iniciar sesión">
                        <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            aria-hidden="true">
                            <rect x="3" y="7" width="10" height="7" rx="1.5" />
                            <path d="M5 7V5a3 3 0 0 1 6 0v2" />
                        </svg>
                    </Link>
                </footer>
            )}

            <BotonScrollTop />
        </div>
    );
}