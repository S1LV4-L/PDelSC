import '../styles/Dev.css';
import { ThemeToggle } from '../components/BotonTema';
import { BotonScrollTop } from '../components/BotonScrollTop';

export default function Dev() {
  

  return (
      <div>
        <ThemeToggle/>
        <div className="dev-modificar">
        </div>
        <BotonScrollTop/>
    </div>
    
  );
}