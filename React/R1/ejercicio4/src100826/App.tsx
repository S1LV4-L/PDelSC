import "./App.css";
import { ThemeToggle } from "./components/BotonTema";
import ListaTareas from "./components/ListaTareas";

function App() {
    return (
        <>
        <h1>Lista de Tareas</h1>
        <ThemeToggle />
        <ListaTareas />
        </>
    );
}

export default App;
