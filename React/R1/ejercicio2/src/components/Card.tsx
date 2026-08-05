import '../styles/Card.css';

interface CardProps {
  nombre: string;
  apellido: string;
  profesion: string;
  imageUrl?: string;
  buttonText?: string;
  onButtonClick?: () => void;
}

export default function Card({ nombre, apellido, profesion, imageUrl }: CardProps) {
  return (
    <div className="presentation-card">
      {imageUrl && <img src={imageUrl} alt={nombre} className="card-img" />}
      <div className="card-content">
        <h3 className="card-title">{nombre} {apellido}</h3>
        <p className="card-desc">{profesion}</p>
      </div>
    </div>
  );
}