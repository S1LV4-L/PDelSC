// Instancia centralizada de Axios para comunicarse con el back.
// Cualquier archivo que necesite hacer un pedido HTTP importa este objeto en vez de configurar Axios de nuevo cada vez.
import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL, // URL base del backend Node/Express ('http://localhost:3000/api')
});

// Interceptor: se ejecuta ANTES de cada pedido.
// Si hay un token guardado (usuario logueado), lo agrega automáticamente al header Authorization
// para no tener que hacerlo a mano en cada llamada.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;