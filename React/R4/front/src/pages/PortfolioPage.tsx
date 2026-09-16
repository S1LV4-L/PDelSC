// Página del Portfolio.
import { Link } from "react-router-dom";
import "../styles/PortfolioPage.css"
import "../styles/estilos.css";
import { ThemeToggle } from "../components/BotonTema";
import { BotonScrollTop } from "../components/BotonScrollTop";

export default function PortfolioPage() {

    return (
        <div>
            <ThemeToggle />
            <header className="home-header">
                <h1>Bienvenido</h1>
                    <div>
                        <Link className="btn-link" to="/dev">Dev</Link>
                    </div>
            </header>

            <BotonScrollTop/>
        </div>
    );
}