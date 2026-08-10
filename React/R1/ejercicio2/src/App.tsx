import Card from './components/Card';
import { ThemeToggle } from './components/BotonTema';

export default function App() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '0.3rem', flexWrap: 'wrap', gap: '1rem' }}>
      <ThemeToggle />
      <Card
        nombre="Juan"
        apellido="Pérez"
        profesion="Ingeniero"
        imageUrl="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRAQR1eYuQUvxpgplC4aAZbWWWSbBgMxXXmNGRmHRhxkN5UKOkiTqpMVAk&s=10"
      />
      <Card
        nombre="Pedro"
        apellido="García"
        profesion="Contador"
        imageUrl="https://www.unila.edu.mx/wp-content/uploads/2025/01/Contador-general-portada.jpg"
      />
      <Card
        nombre="Carlos"
        apellido="González"
        profesion="Médico"
        imageUrl="https://akm-img-a-in.tosshub.com/indiatoday/images/story/201803/healthcare_647.jpeg?size=690:388"
      />
      <Card
        nombre="Javier"
        apellido="Romero"
        profesion="Periodista"
        imageUrl="https://www.lanacion.com.ar/resizer/v2/la-fecha-en-que-se-celebra-el-dia-del-periodista-IRCYMZRVWNHYVH3TD4AOJ6VH34.jpg?auth=628c8bb9d461c3507c840cbb504c8ac225659f7d652aba1b102da8ad623c0838&width=1200&height=900&quality=70&smart=true"
      />
      <Card
        nombre="Alejandro"
        apellido="González"
        profesion="Fotógrafo"
        imageUrl="https://th.bing.com/th/id/R.06b5bf6ec9c9f3e66ad0da88b37f0252?rik=AqWLG7W93ZcWbA&pid=ImgRaw&r=0"
      />
      <Card
        nombre="Miguel"
        apellido="Álvarez"
        profesion="Científico"
        imageUrl="https://www.ejemplos.co/wp-content/uploads/2016/11/metodo-cientifico-scaled.jpg"
      />
    </div>
  );
}