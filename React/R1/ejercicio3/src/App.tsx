import "./App.css";
import { Contador } from "./components/Contador";
import { ThemeToggle } from "./components/BotonTema";

function App() {
    return (
        <>
            <ThemeToggle />
            <h1>Contador</h1>
            <div className="divCont">
                <Contador value={0} />
            </div>
        </>
    );
}

export default App;
