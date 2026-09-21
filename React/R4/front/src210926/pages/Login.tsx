// Página de inicio de sesión.
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { validarNombre, validarPassword } from '../utils/validaciones';
import type { LoginFormDatos } from '../types';
import '../styles/Login.css';
import { ThemeToggle } from '../components/BotonTema';

export default function Login() {
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormDatos>();

  const onSubmit = async (datos: LoginFormDatos) => {
    try {
      const usuario = await login(datos.nombreUsuario, datos.password);
      // Redirección basada en el perfil usando Router
      if (usuario.perfil.nombre === 'Administrador') {
        navigate('/dev');
      } else {
        navigate('/');
      }
    } catch {
      setError('Credenciales inválidas');
    }
  };

  const handleGoHome = () => navigate('/');

  return (
    <div className="login-container">
      <ThemeToggle />
      
      <form className="login-card" onSubmit={handleSubmit(onSubmit)}>
        <h1>Iniciar sesión</h1>
        {error && <p className="error">{error}</p>}

        <label htmlFor="login-usuario">Nombre de usuario</label>
        <input
          id="login-usuario"
          placeholder="Juan123"
          autoComplete="username"
          {...register('nombreUsuario', { validate: validarNombre.noVacio })} 
        />
        {errors.nombreUsuario && <p className="error">{errors.nombreUsuario.message}</p>}

        <label htmlFor="login-passwd">Contraseña</label>
        <input
          id="login-passwd"
          type="password"
          placeholder="Ingrese su contraseña"
          autoComplete="current-password"
          {...register('password', { validate: validarPassword.noVacio })}
        />
        {errors.password && <p className="error">{errors.password.message}</p>}

        <div className="login-acciones">
          <button type="submit">Ingresar</button>
        </div>

        <div className="login-links">
          <button type="button" className="btn-link" onClick={handleGoHome}>Volver al Home</button>
        </div>
      </form>
    </div>
  );
}