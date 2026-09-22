// Tablero de imágenes
import { Link } from "react-router-dom";
import '../styles/Galeria.css';
import { ThemeToggle } from "../components/BotonTema";
import { BotonScrollTop } from "../components/BotonScrollTop";

const imagenes: string[] = [
  'https://picsum.photos/id/10/400/300',
  'https://picsum.photos/id/20/400/300',
  'https://picsum.photos/id/30/400/300',
  'https://picsum.photos/id/40/400/300',
  'https://picsum.photos/id/50/400/300',
  'https://picsum.photos/id/60/400/300',
  'https://picsum.photos/id/70/400/300',
  'https://picsum.photos/id/80/400/300',
  'https://picsum.photos/id/90/400/300',
  'https://picsum.photos/id/100/400/300',
  'https://picsum.photos/id/110/400/300',
  'https://picsum.photos/id/120/400/300'
];

export default function Galeria() {
  return (
    <div>
      <ThemeToggle/>
      <h1>Galería</h1>
      <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
        <Link className="btn-link" to="/">Volver al Home</Link>
      </div>
      <div className="galeria-tablero">
        {imagenes.map((url) => (
          <div key={url} className="galeria-celda">
            <img src={url} alt="Imagen de galería" />
          </div>
        ))}
      </div>
      <BotonScrollTop/>
    </div>
  );
}