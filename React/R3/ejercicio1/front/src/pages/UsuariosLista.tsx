// Página protegida: Lista y Gestión de usuarios en una sola página.
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useUsuarios } from '../hooks/useUsuarios';
import { validarNombre } from '../utils/validaciones';
import type { UsuarioFormDatos, Perfil, Usuario } from '../types';
import '../styles/UsuariosLista.css';
import { ThemeToggle } from '../components/BotonTema';
import { BotonScrollTop } from '../components/BotonScrollTop';

export default function UsuariosLista() {
  const { usuarios, loading, error, eliminarUsuario, cargarUsuarios } = useUsuarios();
  
  // Estados para manejar el formulario incrustado
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [esEdicion, setEsEdicion] = useState(false);
  const [usuarioIdEditando, setUsuarioIdEditando] = useState<number | null>(null);
  const [perfiles, setPerfiles] = useState<Perfil[]>([]);

  const { 
    register, 
    handleSubmit, 
    reset, 
    formState: { errors } 
  } = useForm<UsuarioFormDatos>();

  // Cargar perfiles para el select
  useEffect(() => {
    api.post<Perfil[]>("/perfiles/listar").then(({ data }) => setPerfiles(data));
  }, []);

  // Abrir formulario para CREAR
  const handleNuevoClick = () => {
    reset(); // Limpiar campos
    setEsEdicion(false);
    setUsuarioIdEditando(null);
    setMostrarFormulario(true);
  };

  // Abrir formulario para EDITAR
  const handleEditarClick = (usuario: Usuario) => {
    setEsEdicion(true);
    setUsuarioIdEditando(usuario.id);
    // Precargamos los datos desde la lista local (no necesitamos ir al detalle API)
    reset({ 
      nombre: usuario.nombre, 
      perfilId: usuario.perfil.id 
    });
    setMostrarFormulario(true);
  };

  // Cerrar formulario
  const handleCancelar = () => {
    setMostrarFormulario(false);
    reset();
  };

  // Enviar datos (Crear o Actualizar)
  const onSubmit = async (datos: UsuarioFormDatos) => {
    try {
      if (esEdicion && usuarioIdEditando) {
        // Actualizar
        await api.post("/usuarios/actualizar", { id: usuarioIdEditando, ...datos });
      } else {
        // Crear
        await api.post("/usuarios/crear", datos);
      }
      // Recargar lista y cerrar formulario
      await cargarUsuarios();
      setMostrarFormulario(false);
      reset();
    } catch (err) {
      console.error(err);
      alert("Error al guardar el usuario");
    }
  };

  if (loading) return <p>Cargando...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
      <div>
        <ThemeToggle/>
        <div className="usuarios-lista-page">
          <div className="usuarios-header">
            <h1>Usuarios</h1>
            <div className='usuarios-header-btns'>
              <Link className="btn-link" to="/">Volver al Home</Link>
              <button className="btn-link" onClick={handleNuevoClick}>Nuevo usuario</button>
            </div>
          </div>

          {/* FORMULARIO INCRUSTADO (Condicional) */}
          {mostrarFormulario && (
            <form className="usuario-form-embedded" onSubmit={handleSubmit(onSubmit)}>
              <h2>{esEdicion ? "Editar usuario" : "Nuevo usuario"}</h2>

              <div className="form-group">
                <input placeholder="Nombre" {...register("nombre", { validate: validarNombre })} />
                {errors.nombre && <p className="error">{errors.nombre.message}</p>}
              </div>

              <div className="form-group">
                <select {...register("perfilId", {
                    valueAsNumber: true,
                    validate: (valor) => (valor > 0 ? true : "El perfil es obligatorio"),
                  })}>
                  <option value="">Seleccionar perfil</option>
                  {perfiles.map((p) => ( <option key={p.id} value={p.id}>{p.nombre}</option>))}
                </select>
                {errors.perfilId && <p className="error">{errors.perfilId.message}</p>}
              </div>

              <div className="form-actions">
                <button type="submit">Guardar</button>
                <button type="button" className="btn-link btn-cancelar" onClick={handleCancelar}>Cancelar</button>
              </div>
            </form>
          )}

          <ul className="lista-items">
            {usuarios.map((u) => (
              <li key={u.id} className="lista-item">
                <span className="usuario-info">
                  <span className="usuario-nombre">{u.nombre}</span>
                  <span className="perfil-tag">({u.perfil.nombre})</span>
                  
                  {u.perfil.permisos && u.perfil.permisos.length > 0 && (
                    <ul className="permisos-lista">
                      {u.perfil.permisos.map((p) => (
                        <li key={p.id}>{p.nombre}</li>
                      ))}
                    </ul>
                  )}
                </span>
                
                <div className="usuario-acciones">
                    <button className="btn-link btn-small" onClick={() => handleEditarClick(u)}>Editar</button>
                    <button onClick={() => eliminarUsuario(u.id)} className="btn-link btn-small btn-peligro">Eliminar</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <BotonScrollTop/>
    </div>
    
  );
}