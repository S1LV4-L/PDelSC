import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PortfolioProvider } from './context/PortfolioContext';
import ProtectedRoute from './components/ProtectedRoute';
import PortfolioPage from './pages/PortfolioPage';
import Login from './pages/Login';
import Dev from './pages/Dev';

export default function App() {
    return (
        <AuthProvider>
            <PortfolioProvider>
                <Routes>
                    <Route path="/" element={<PortfolioPage />} />
                    
                    <Route path="/login" element={<Login />} />

                    <Route path="/dev" element={<ProtectedRoute soloAdmin><Dev /></ProtectedRoute>} />
                </Routes>
            </PortfolioProvider>
        </AuthProvider>
    );
}