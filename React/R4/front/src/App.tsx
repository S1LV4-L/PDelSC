import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import PortfolioPage from './pages/PortfolioPage';
import Dev from './pages/Dev';

export default function App() {
    return (
        <AuthProvider>
          {/* AuthProvider envuelve toda la app para que cualquier página
          pueda acceder al usuario logueado mediante el hook useAuth() */}
            <Routes>
                {/* Rutas públicas (no requieren estar logueado) */}
                <Route path="/" element={<PortfolioPage />} />

                {/* ProtectedRoute redirige a /login si no hay sesión */}
                <Route path="/galeria" element={<ProtectedRoute><Dev /></ProtectedRoute>} />
            </Routes>
        </AuthProvider>
    );
}