import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Details from './pages/Details'
import Creation from './pages/Creation'
import './styles/Estilos.css'

// atomizar
// mejorar css

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/tarea/:id" element={<Details />} />
      <Route path="/crear" element={<Creation />} />
    </Routes>
  )
}

export default App