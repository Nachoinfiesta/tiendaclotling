import axios from 'axios';
import { API_ROUTES } from './apiRoutes';
import appConfig from '../config/appConfig';

// Crear una instancia de axios con configuración base
const apiClient = axios.create({
  baseURL: appConfig.api.baseUrl,
  timeout: appConfig.api.timeout,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para añadir token de autenticación en cada solicitud
apiClient.interceptors.request.use(
  (config) => {
    // Leer el token del usuario del localStorage
    const userStr = localStorage.getItem(appConfig.auth.tokenStorageKey);
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user && user.token) {
          config.headers['Authorization'] = `Bearer ${user.token}`;
        }
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores de forma centralizada
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Manejar errores comunes (401, 403, 500, etc.)
    if (error.response) {
      // Error del servidor con respuesta
      const status = error.response.status;
      
      if (status === 401) {
        // Error de autenticación - redirigir al login
        console.warn('Sesión expirada o no válida');
        // Limpiar datos de usuario si el token es inválido
        localStorage.removeItem('user');
        
        // Opcional: Redirigir al login
        if (window.location.pathname !== '/login') {
          window.location.href = '/login?expired=true';
        }
      }
      
      if (status === 403) {
        console.warn('Acceso prohibido');
      }
      
      if (status === 500) {
        console.error('Error interno del servidor');
      }
    } else if (error.request) {
      // La solicitud se hizo pero no se recibió respuesta
      console.error('No se recibió respuesta del servidor');
    } else {
      // Error en la configuración de la solicitud
      console.error('Error en la configuración de la solicitud:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Servicio de autenticación
export const authService = {
  login: (credentials) => apiClient.post(API_ROUTES.AUTH.LOGIN, credentials),
  register: (userData) => apiClient.post(API_ROUTES.AUTH.REGISTER, userData),
  getProfile: () => apiClient.get(API_ROUTES.AUTH.PROFILE),
  updateProfile: (data) => apiClient.put(API_ROUTES.AUTH.PROFILE, data),
  logout: () => apiClient.post(API_ROUTES.AUTH.LOGOUT)
};

// Servicio de publicaciones
export const postService = {
  getAllPosts: () => apiClient.get(API_ROUTES.POSTS.GET_ALL),
  getPostById: (id) => apiClient.get(`${API_ROUTES.POSTS.GET_BY_ID}/${id}`),
  createPost: (postData) => apiClient.post(API_ROUTES.POSTS.CREATE, postData),
  updatePost: (id, postData) => apiClient.put(`${API_ROUTES.POSTS.UPDATE}/${id}`, postData),
  deletePost: (id) => apiClient.delete(`${API_ROUTES.POSTS.DELETE}/${id}`),
  getUserPosts: () => apiClient.get(API_ROUTES.POSTS.USER_POSTS),
  searchPosts: (query) => apiClient.get(`${API_ROUTES.POSTS.SEARCH}?q=${encodeURIComponent(query)}`)
};

// Servicio de favoritos
export const favoriteService = {
  toggleFavorite: (postId) => apiClient.post(API_ROUTES.FAVORITES.TOGGLE, { publicacion_id: postId }),
  getFavorites: () => apiClient.get(API_ROUTES.FAVORITES.GET_ALL),
  checkFavorite: (postId) => apiClient.get(`${API_ROUTES.FAVORITES.CHECK}/${postId}`)
};

// Servicio de categorías
export const categoryService = {
  getAllCategories: () => apiClient.get(API_ROUTES.CATEGORIES.GET_ALL)
};

// Servicio de carga de archivos
export const uploadService = {
  uploadImage: (formData, onProgress) => {
    return apiClient.post(API_ROUTES.UPLOAD.IMAGE, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      }
    });
  },
  
  uploadRegistrationImage: (formData, onProgress) => {
    return apiClient.post(API_ROUTES.UPLOAD.REGISTRATION_IMAGE, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      }
    });
  }
};

export default apiClient;
