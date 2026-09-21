import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PortfolioProvider } from './context/PortfolioContext';
import ProtectedRoute from './components/ProtectedRoute';
import PortfolioPage from './pages/PortfolioPage';
import Login from './pages/Login'; // <--- Importar Login
import Dev from './pages/Dev';

export default function App() {
    return (
        <AuthProvider>
            <PortfolioProvider>
                <Routes>
                    {/* Rutas públicas */}
                    <Route path="/" element={<PortfolioPage />} />
                    
                    {/* Ruta de Login */}
                    <Route path="/login" element={<Login />} />

                    {/* Ruta protegida */}
                    <Route path="/dev" element={<ProtectedRoute soloAdmin><Dev /></ProtectedRoute>} />
                </Routes>
            </PortfolioProvider>
        </AuthProvider>
    );
}