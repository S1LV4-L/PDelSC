import "./App.css";
import { Contador } from "./components/Contador";
import { ThemeToggle } from "./components/BotonTema";

function App() {
    return (
        <div className="app-layout">
            <ThemeToggle />
            <div className="contador-wrapper">
                <h1 className="contador-titulo">Contador</h1>
                <Contador value={0} />
            </div>
        </div>
    );
}

export default App;