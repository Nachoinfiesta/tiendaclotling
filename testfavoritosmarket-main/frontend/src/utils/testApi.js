import axios from 'axios';
import { authService, postService, categoryService, favoriteService } from '../services/apiClient';

const testBackendConnection = async () => {
  try {
    // Intentar una petición simple al backend
    const response = await axios.get('https://favoritosmarket-api.onrender.com/');
    console.log('Conexión exitosa al backend:', response.data);
    return true;
  } catch (error) {
    console.error('Error conectando al backend:', error);
    return false;
  }
};

/**
 * Función para probar la conexión y servicios API
 */
export const testAllServices = async () => {
  console.group('=== PRUEBAS DE API ===');
  
  try {
    // Probar servicio de categorías (público)
    console.log('Probando servicio de categorías...');
    const categoriesResponse = await categoryService.getAllCategories();
    console.log('✅ Categorías obtenidas:', categoriesResponse.data.length);
    
    // Probar inicio de sesión
    console.log('\nProbando inicio de sesión...');
    const loginResponse = await authService.login({
      email: 'demo@example.com',
      password: 'password123'
    });
    console.log('✅ Login exitoso, token recibido:', !!loginResponse.data.token);
    
    // Probar obtener publicaciones
    console.log('\nProbando obtener publicaciones...');
    const postsResponse = await postService.getAllPosts();
    console.log('✅ Publicaciones obtenidas:', postsResponse.data.length);
    
    // Si hay publicaciones, probar favoritos
    if (postsResponse.data.length > 0) {
      const firstPostId = postsResponse.data[0].id;
      console.log('\nProbando marcar como favorito, post ID:', firstPostId);
      const favoriteResponse = await favoriteService.toggleFavorite(firstPostId);
      console.log('✅ Toggle favorito respuesta:', favoriteResponse.data);
    }
    
    console.log('\n✅ Todas las pruebas completadas con éxito');
  } catch (error) {
    console.error('❌ Error en las pruebas:', error);
    if (error.response) {
      console.error('Detalles del error:', error.response.data);
    }
  }
  
  console.groupEnd();
  
  return 'Pruebas finalizadas. Revisa la consola para ver los resultados.';
};

export default testAllServices;
