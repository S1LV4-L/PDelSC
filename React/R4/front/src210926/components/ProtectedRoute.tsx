// Componente que envuelve una página y bloquea el acceso si no hay usuario logueado, redirigiendo a /login.
// Con soloAdmin=true, además exige que el usuario tenga perfil admin, o redirige a Home.
import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, soloAdmin = false }: { children: ReactNode; soloAdmin?: boolean }) {
  const { usuario, esAdmin } = useAuth();

  // Sin sesión activa: no renderiza la página, redirige. "replace" evita que la ruta protegida quede en el historial del navegador.
  if (!usuario) return <Navigate to="/login" replace />;

  // Con sesión pero sin permisos de admin: redirige a Home.
  if (soloAdmin && !esAdmin) return <Navigate to="/" replace />;

  return <>{children}</>; // Con sesión (y permisos, si aplica): muestra la página que este componente envuelve.
}