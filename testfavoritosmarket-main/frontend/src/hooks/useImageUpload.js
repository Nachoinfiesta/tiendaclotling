import { useCallback, useContext } from 'react';
import { UserContext } from '../context/UserContext';
import { uploadService } from '../services/apiClient';

/**
 * Hook personalizado para gestionar la carga de imágenes
 * @param {Function} onImageUrlReceived - Callback que se ejecuta al recibir la URL de la imagen
 * @param {boolean} isRegistration - Si es para registro de usuario (no requiere autenticación)
 * @returns {Function} - Función para subir la imagen
 */
export const useImageUpload = (onImageUrlReceived, isRegistration = false) => {
  const { user } = useContext(UserContext);
  
  /**
   * Sube una imagen al servidor
   * @param {File} file - Archivo de imagen a subir
   * @param {Function} setLoading - Función para establecer estado de carga
   * @param {Function} setError - Función para establecer mensaje de error
   * @param {Function} setProgress - Función para actualizar progreso
   * @param {Function} setPreview - Función para actualizar vista previa
   */
  const uploadImage = useCallback(async (file, setLoading, setError, setProgress, setPreview) => {
    if (!file) {
      setError('Por favor selecciona una imagen');
      return;
    }
    
    // Validar autenticación para imágenes que no son de registro
    if (!isRegistration && (!user || !user.token)) {
      setError('Debes iniciar sesión para subir imágenes');
      return;
    }
    
    setLoading(true);
    setError('');
    setProgress(0);
    
    const formData = new FormData();
    formData.append('image', file);
    
    try {
      // Usar el servicio apropiado según el contexto
      const uploadFn = isRegistration
        ? uploadService.uploadRegistrationImage
        : uploadService.uploadImage;
        
      const response = await uploadFn(formData, (progress) => {
        setProgress(progress);
      });
      
      if (response.data && response.data.fileUrl) {
        // Llamar al callback con la URL de la imagen y actualizar vista previa
        onImageUrlReceived(response.data.fileUrl);
        setPreview(response.data.fileUrl);
      } else {
        throw new Error('No se recibió URL de imagen del servidor');
      }
    } catch (err) {
      console.error('Error al subir imagen:', err);
      
      if (err.response) {
        if (err.response.status === 401) {
          setError('Tu sesión ha expirado o no es válida. Intenta iniciar sesión nuevamente.');
        } else {
          setError(`Error: ${err.response.data?.error || 'Hubo un problema al subir la imagen'}`);
        }
      } else if (err.request) {
        setError('No se pudo conectar con el servidor. Verifica tu conexión.');
      } else {
        setError(`Error: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  }, [user, isRegistration, onImageUrlReceived]);
  
  return uploadImage;
};
