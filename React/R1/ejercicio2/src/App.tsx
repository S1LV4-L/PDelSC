import Card from './components/Card.tsx';

export default function App() {
  const handleCardClick = () => {
    alert('Button clicked!');
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '0.5rem' }}>
      <Card 
        nombre="Juan"
        apellido="Pérez"
        profesion="Ingeniero"
        imageUrl="https://picsum.photos/320/160"
        buttonText="View Details"
        onButtonClick={handleCardClick}
      />
    </div>
  );
}