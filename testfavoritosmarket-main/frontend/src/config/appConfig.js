/**
 * Configuración centralizada de la aplicación
 */
const appConfig = {
  // Configuración de API
  api: {
    baseUrl: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
    timeout: 15000,
    retry: {
      maxRetries: 3,
      retryDelay: 1000
    }
  },
  
  // Configuración de imágenes
  upload: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
    defaultImage: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIGZpbGw9IiM5OTkiPlNpbiBJbWFnZW48L3RleHQ+PC9zdmc+'
  },
  
  // Configuración de autenticación
  auth: {
    tokenStorageKey: 'user',
    cookieName: 'token',
    tokenExpiry: '7d'
  },
  
  // Configuración de interfaz de usuario
  ui: {
    notificationDuration: 5000, // 5 segundos
    animationDuration: 300, // 300ms
    paginationSize: 10 // Items por página
  }
};

export default appConfig;
