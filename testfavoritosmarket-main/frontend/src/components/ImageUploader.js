import React from 'react';
import PropTypes from 'prop-types';
import { useImageUpload } from '../hooks/useImageUpload';
import BaseImageUploader from './BaseImageUploader';

/**
 * Componente para subir imágenes con autenticación
 * @param {Object} props - Propiedades del componente
 * @param {Function} props.onImageUploaded - Función a llamar cuando se sube una imagen
 * @param {string} props.initialImage - URL de imagen inicial para mostrar
 * @param {string} props.label - Etiqueta del campo
 * @param {boolean} props.required - Si el campo es obligatorio
 */
const ImageUploader = ({ 
  onImageUploaded, 
  initialImage = '',
  label = 'Imagen',
  required = false
}) => {
  // Usamos nuestro hook personalizado
  const uploadImage = useImageUpload(onImageUploaded, false);
  
  return (
    <BaseImageUploader
      onFileUpload={uploadImage}
      initialImage={initialImage}
      label={label}
      required={required}
    />
  );
};

ImageUploader.propTypes = {
  onImageUploaded: PropTypes.func.isRequired,
  initialImage: PropTypes.string,
  label: PropTypes.string,
  required: PropTypes.bool
};

export default ImageUploader;
