import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Form, Button, Image, Alert } from 'react-bootstrap';
import { UserContext } from '../context/UserContext';
import axios from 'axios';
import ImageUploader from '../components/ImageUploader';

const ProfilePage = () => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Campos editables
  const [nombre, setNombre] = useState('');
  const [fotoPerfil, setFotoPerfil] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Obtener el contexto del usuario
  const { user, login } = useContext(UserContext);

  // Imagen base64 para usar como fallback
  const defaultProfileImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIGZpbGw9IiM5OTkiPlNpbiBJbWFnZW48L3RleHQ+PC9zdmc+';

  // Función para cargar datos del perfil
  const loadProfileData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Verificar si tenemos token antes de hacer la petición
      if (!user?.token) {
        setError('No hay sesión activa. Por favor, inicia sesión nuevamente.');
        setLoading(false);
        return;
      }
      
      console.log('Cargando perfil con token:', user.token.substring(0, 15) + '...');
      
      const response = await axios.get('/api/auth/profile', {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });
      
      // Verificar respuesta y formatear datos
      if (response.data) {
        console.log('Datos de perfil recibidos:', response.data);
        setProfileData(response.data);
        setNombre(response.data.nombre || '');
        setFotoPerfil(response.data.foto_perfil || '');
      } else {
        throw new Error('Respuesta vacía del servidor');
      }
    } catch (err) {
      console.error('Error al cargar datos del perfil:', err);
      
      // Mostrar mensaje específico según el tipo de error
      if (err.response) {
        if (err.response.status === 401) {
          setError('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
          // Considerar cerrar sesión automáticamente
          // logout();
        } else {
          setError(`Error del servidor: ${err.response.data?.error || 'Algo salió mal'}`);
        }
      } else if (err.request) {
        setError('No se pudo conectar con el servidor. Verifica tu conexión a internet.');
      } else {
        setError(`Error: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    loadProfileData();
  }, [user?.token]); // Eliminado loadProfileData como dependencia

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    
    try {
      if (!user?.token) {
        setError('Debes iniciar sesión para actualizar tu perfil');
        return;
      }

      const updateData = {
        nombre,
        foto_perfil: fotoPerfil
      };

      // Renombrada 'response' a 'updateResponse' para usar la variable
      const updateResponse = await axios.put('/api/auth/profile', updateData, {
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Perfil actualizado:', updateResponse.data);

      // Actualizar datos locales
      setProfileData({
        ...profileData,
        ...updateData
      });

      // Actualizar contexto del usuario
      login({
        ...user,
        nombre,
        foto_perfil: fotoPerfil
      });

      setSuccess(true);
      setIsEditing(false);
      
      // Ocultar mensaje de éxito después de 3 segundos
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Error al actualizar perfil:', err);
      setError('No se pudo actualizar el perfil. Intenta de nuevo más tarde.');
    }
  };

  // Función para manejar URLs de imagen inválidas
  const handleImageError = (e) => {
    // Prevenimos el bucle infinito verificando si ya hemos intentado cargar una imagen de respaldo
    if (e.target.hasAttribute('data-fallback-applied')) {
      return; // Ya aplicamos una imagen de respaldo, no hacemos nada más
    }
    
    // Marcamos que hemos aplicado una imagen de respaldo
    e.target.setAttribute('data-fallback-applied', 'true');
    
    // Usamos una imagen base64 minimalista
    e.target.src = defaultProfileImage;
  };

  // Manejar la subida de la imagen de perfil
  const handleImageUploaded = (imageUrl) => {
    setFotoPerfil(imageUrl);
  };

  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <p>Cargando datos del perfil...</p>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container className="mt-5">
        <Alert variant="warning">
          Debes iniciar sesión para ver tu perfil
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-5">
      <h1>Mi Perfil</h1>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">¡Perfil actualizado con éxito!</Alert>}

      <Row>
        <Col md={4} className="text-center mb-4">
          <Image 
            src={fotoPerfil || defaultProfileImage} 
            roundedCircle 
            width={150} 
            height={150} 
            className="mb-3"
            onError={handleImageError}
          />
          {isEditing && (
            <ImageUploader 
              onImageUploaded={handleImageUploaded}
              initialImage={fotoPerfil}
            />
          )}
        </Col>

        <Col md={8}>
          <Form onSubmit={handleUpdateProfile}>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control 
                type="email" 
                value={profileData?.email || ''} 
                disabled 
              />
              <Form.Text className="text-muted">
                No es posible cambiar el email asociado a tu cuenta.
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Nombre</Form.Label>
              <Form.Control 
                type="text" 
                value={nombre} 
                onChange={(e) => setNombre(e.target.value)}
                disabled={!isEditing} 
              />
            </Form.Group>

            {!isEditing ? (
              <Button 
                variant="primary" 
                onClick={() => setIsEditing(true)}
              >
                Editar Perfil
              </Button>
            ) : (
              <div className="d-flex gap-2">
                <Button 
                  variant="secondary" 
                  onClick={() => {
                    setIsEditing(false);
                    setNombre(profileData?.nombre || '');
                    setFotoPerfil(profileData?.foto_perfil || '');
                  }}
                >
                  Cancelar
                </Button>
                <Button 
                  variant="success" 
                  type="submit"
                >
                  Guardar Cambios
                </Button>
              </div>
            )}
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default ProfilePage;