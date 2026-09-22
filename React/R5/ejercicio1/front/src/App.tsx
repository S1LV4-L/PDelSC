import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Galeria from './pages/Galeria';
import Login from './pages/Login';
import Registro from './pages/Registro';
import OlvidePassword from './pages/OlvidePassword';
import UsuariosLista from './pages/UsuariosLista';
import MiCuenta from './pages/MiCuenta';
import AuthCallback from './pages/AuthCallback';

export default function App() {
    return (
        <AuthProvider>
          {/* AuthProvider envuelve toda la app para que cualquier página
          pueda acceder al usuario logueado mediante el hook useAuth() */}
            <Routes>
                {/* Rutas públicas (no requieren estar logueado) */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/registro" element={<Registro />} />
                <Route path="/olvide-password" element={<OlvidePassword />} />
                <Route path="/auth-callback" element={<AuthCallback />} />

                {/* ProtectedRoute redirige a /login si no hay sesión */}
                <Route path="/galeria" element={<ProtectedRoute><Galeria /></ProtectedRoute>} />
                <Route path="/usuarios" element={<ProtectedRoute><UsuariosLista /></ProtectedRoute>} />
                <Route path="/mi-cuenta" element={<ProtectedRoute><MiCuenta /></ProtectedRoute>} />
            </Routes>
        </AuthProvider>
    );
}