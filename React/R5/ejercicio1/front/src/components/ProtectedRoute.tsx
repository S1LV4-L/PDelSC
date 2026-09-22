// Componente que envuelve una página y bloquea el acceso si no hay usuario logueado, redirigiendo a /login.
import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { usuario } = useAuth();

  // Sin sesión activa: no renderiza la página, redirige. "replace" evita que la ruta protegida quede en el historial del navegador.
  if (!usuario) return <Navigate to="/login" replace />;

  return <>{children}</>; // Con sesión activa: muestra la página que este componente envuelve.
}