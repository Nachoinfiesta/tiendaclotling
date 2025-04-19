import axios from 'axios';

// Configuración fija para producción sin depender de variables de entorno
const baseURL = 'https://favoritosmarket-api.onrender.com';

const instance = axios.create({
  baseURL: baseURL,
});

console.log('API URL configurada:', baseURL);

// Interceptor para incluir el token en las solicitudes
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar errores de respuesta
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log para depuración
    console.error('Error de API:', error.response || error.message);
    
    // Si el error es 401 (no autorizado), limpia el almacenamiento local
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Opcionalmente, redirigir a la página de inicio de sesión
    }
    
    return Promise.reject(error);
  }
);

export default instance;
