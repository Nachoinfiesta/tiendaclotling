import React from 'react';
import PropTypes from 'prop-types';
import { useImageUpload } from '../hooks/useImageUpload';
import BaseImageUploader from './BaseImageUploader';

/**
 * Componente para subir imágenes durante el registro (sin autenticación)
 * @param {Object} props - Propiedades del componente
 * @param {Function} props.onImageUploaded - Función a llamar cuando se sube una imagen
 * @param {string} props.initialImage - URL de imagen inicial para mostrar
 */
const RegistrationImageUploader = ({ onImageUploaded, initialImage = '' }) => {
  // Usamos nuestro hook personalizado con isRegistration = true
  const uploadImage = useImageUpload(onImageUploaded, true);
  
  return (
    <BaseImageUploader
      onFileUpload={uploadImage}
      initialImage={initialImage}
      label="Foto de Perfil"
      required={false}
    />
  );
};

RegistrationImageUploader.propTypes = {
  onImageUploaded: PropTypes.func.isRequired,
  initialImage: PropTypes.string
};

export default RegistrationImageUploader;
