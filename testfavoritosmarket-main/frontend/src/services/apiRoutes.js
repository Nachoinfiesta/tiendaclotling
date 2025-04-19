/**
 * Rutas API centralizadas para el proyecto
 */
export const API_ROUTES = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    PROFILE: '/auth/profile',
    LOGOUT: '/auth/logout'
  },
  POSTS: {
    GET_ALL: '/posts',
    GET_BY_ID: '/posts',
    CREATE: '/posts/create-post',
    UPDATE: '/posts/update',
    DELETE: '/posts',
    USER_POSTS: '/posts/user-posts',
    SEARCH: '/posts/search',
    CLAIM: '/posts/claim'
  },
  FAVORITES: {
    TOGGLE: '/favorites',
    GET_ALL: '/favorites',
    CHECK: '/favorites/check'
  },
  CATEGORIES: {
    GET_ALL: '/categories'
  },
  UPLOAD: {
    IMAGE: '/upload/image',
    REGISTRATION_IMAGE: '/upload/registration-image'
  }
};
