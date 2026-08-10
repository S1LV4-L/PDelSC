import '../styles/Card.css';

// Props que recibe la card: datos de la persona e imagen opcional
interface CardProps {
  nombre: string;
  apellido: string;
  profesion: string;
  imageUrl?: string;
}

// Card reutilizable para mostrar la presentación de una persona
export default function Card({ nombre, apellido, profesion, imageUrl }: CardProps) {
  return (
    <div className="presentation-card">
      {imageUrl && <img src={imageUrl} alt={`${nombre} ${apellido}`} className="card-img" />}
      <div className="card-content">
        <h3 className="card-title">{nombre} {apellido}</h3>
        <p className="card-desc">{profesion}</p>
      </div>
    </div>
  );
}