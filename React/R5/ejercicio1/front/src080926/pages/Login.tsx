// Página de inicio de sesión.
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
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
      // Solo Administrador entra al sistema de gestión; el resto va a Home
      navigate(usuario.perfil.nombre === 'Administrador' ? '/usuarios' : '/');
    } catch {
      setError('Credenciales inválidas');
    }
  };

  return (
    <div>
      <ThemeToggle/>
        <form className="login-page" onSubmit={handleSubmit(onSubmit)}>
        <h1>Iniciar sesión</h1>
        {error && <p className="error">{error}</p>}

        <label htmlFor="login-usuario">Nombre de usuario</label>
        <input
          placeholder="Juan123"
          {...register('nombreUsuario', { validate: validarNombre })}
        />
        {errors.nombreUsuario && <p className="error">{errors.nombreUsuario.message}</p>}

        <label htmlFor="login-passwd">Contraseña</label>
        <input
          type="password"
          placeholder="Ingrese su contraseña"
          {...register('password', { validate: validarPassword })}
        />
        {errors.password && <p className="error">{errors.password.message}</p>}

        <div className="login-acciones">
          <button type="submit">Ingresar</button>
          <Link className="btn-link" to="/registro">Crear cuenta</Link>
          <Link className="btn-link" to="/olvide-password">Olvidé mi contraseña</Link>
          <Link className="btn-link" to="/">Volver al Home</Link>
        </div>
      </form>
    </div>
  );
}