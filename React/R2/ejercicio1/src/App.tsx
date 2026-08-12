import './App.css'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Creation from './pages/Creation'
import Details from './pages/Details'
import { ThemeToggle } from './components/BotonTema'

function App() {
  return (
    <>
    <ThemeToggle />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/creation" element={<Creation />} />
      <Route path='/details' element={<Details />} />
    </Routes>
    </>
  )
}

export default App