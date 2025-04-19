import React, { useState, useRef } from 'react';
import { Button, Form, Image, Spinner, Alert, ProgressBar } from 'react-bootstrap';
import PropTypes from 'prop-types';
import appConfig from '../config/appConfig';

/**
 * Componente base para cargar imágenes
 * @param {Object} props - Propiedades del componente
 * @param {Function} props.onFileUpload - Función a llamar cuando se sube un archivo
 * @param {string} props.initialImage - URL de imagen inicial para mostrar
 * @param {string} props.label - Etiqueta del campo
 * @param {boolean} props.required - Si el campo es obligatorio
 * @param {Object} props.customRequestConfig - Configuración personalizada para la solicitud
 */
const BaseImageUploader = ({
  onFileUpload,
  initialImage = '',
  label = 'Imagen',
  required = false,
  customRequestConfig = {}
}) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(initialImage || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);

  // Imagen fallback para errores
  const fallbackImage = appConfig.upload.defaultImage;

  /**
   * Maneja el cambio de archivo seleccionado
   * @param {Event} event - Evento de cambio de archivo
   */
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validación de tamaño
    if (file.size > appConfig.upload.maxSize) {
      setError(`La imagen no debe superar los ${appConfig.upload.maxSize / (1024 * 1024)}MB`);
      return;
    }

    // Validación de tipo de archivo
    if (!appConfig.upload.allowedTypes.includes(file.type)) {
      setError(`Formato no soportado. Use ${appConfig.upload.allowedExtensions.join(', ')}`);
      return;
    }

    setSelectedFile(file);
    setError('');
    
    // Crear URL para previsualización
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  /**
   * Maneja acción de arrastrar y soltar
   * @param {DragEvent} e - Evento de arrastrar
   */
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange({ target: { files: e.dataTransfer.files }});
    }
  };

  /**
   * Previene comportamiento predeterminado durante arrastre
   * @param {DragEvent} e - Evento de arrastre sobre elemento
   */
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  /**
   * Maneja errores en la carga de imágenes
   * @param {Event} e - Evento de error
   */
  const handleImageError = (e) => {
    if (e.target.hasAttribute('data-fallback-applied')) return;
    e.target.setAttribute('data-fallback-applied', 'true');
    e.target.src = fallbackImage;
  };

  return (
    <Form.Group className="mb-3">
      <Form.Label>{label} {required && <span className="text-danger">*</span>}</Form.Label>
      
      {preview && (
        <div className="mb-3 text-center">
          <Image 
            src={preview} 
            alt="Previsualización" 
            style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }} 
            thumbnail
            onError={handleImageError}
          />
        </div>
      )}
      
      <div 
        className="drop-area p-4 mb-2 border rounded text-center"
        style={{ 
          border: '2px dashed #ccc', 
          backgroundColor: '#f8f9fa',
          cursor: 'pointer'
        }}
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <p className="mb-1">
          <i className="bi bi-cloud-arrow-up" style={{ fontSize: '2rem' }}></i>
        </p>
        <p>Arrastra una imagen aquí o haz clic para seleccionar</p>
        <Form.Control 
          type="file" 
          onChange={handleFileChange}
          accept="image/*"
          disabled={loading}
          style={{ display: 'none' }}
          ref={fileInputRef}
        />
      </div>
      
      {progress > 0 && loading && (
        <ProgressBar now={progress} label={`${progress}%`} className="mt-2" />
      )}
      
      <div className="mt-2">
        <Button 
          variant="primary" 
          onClick={() => onFileUpload(selectedFile, setLoading, setError, setProgress, setPreview)}
          disabled={!selectedFile || loading}
          className="mt-2 w-100"
        >
          {loading ? (
            <>
              <Spinner as="span" animation="border" size="sm" /> Subiendo...
            </>
          ) : 'Subir Imagen'}
        </Button>
      </div>
      
      {error && (
        <Alert variant="danger" className="mt-2">
          {error}
          {error.includes('sesión') && (
            <div className="mt-2">
              <Button variant="outline-primary" size="sm" onClick={() => window.location.href = '/login'}>
                Iniciar sesión nuevamente
              </Button>
            </div>
          )}
        </Alert>
      )}
      
      <Form.Text className="text-muted mt-2 d-block">
        Formatos permitidos: {appConfig.upload.allowedExtensions.join(', ')}. 
        Tamaño máximo: {appConfig.upload.maxSize / (1024 * 1024)}MB.
      </Form.Text>
    </Form.Group>
  );
};

BaseImageUploader.propTypes = {
  onFileUpload: PropTypes.func.isRequired,
  initialImage: PropTypes.string,
  label: PropTypes.string,
  required: PropTypes.bool,
  customRequestConfig: PropTypes.object
};

export default BaseImageUploader;
