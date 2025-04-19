import React, { useState } from 'react';
import { Form, Button, Container, Row, Col } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import RegistrationImageUploader from '../components/RegistrationImageUploader';
import { authService } from '../services/apiClient';
import { useNotification } from '../context/NotificationContext';
import { formValidators } from '../utils/validators';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nombre: '',
    foto_perfil: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  
  // Manejar cambios en los campos del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Manejador para la imagen cargada
  const handleImageUploaded = (imageUrl) => {
    setFormData(prev => ({
      ...prev,
      foto_perfil: imageUrl
    }));
  };

  // Manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar campos obligatorios
    if (!formData.email || !formData.password || !formData.nombre) {
      showError('Por favor, completa los campos obligatorios.');
      return;
    }
    
    // Validar formato de email
    if (!formValidators.isValidEmail(formData.email)) {
      showError('Por favor, ingresa un email válido.');
      return;
    }
    
    // Validar longitud de contraseña
    if (formData.password.length < 6) {
      showError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await authService.register(formData);
      console.log('Registro exitoso:', response.data);

      showSuccess('Registro exitoso. Redirigiendo al inicio de sesión...');

      // Redirigir al usuario al login después de 2 segundos
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      // Manejar errores del backend
      if (err.response && err.response.data.error) {
        showError(err.response.data.error);
      } else {
        showError('Ocurrió un error. Por favor, inténtalo más tarde.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-md-center">
        <Col md={6}>
          <h1 className="text-center mb-4">Registro</h1>

          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="formNombre" className="mb-3">
              <Form.Label>Nombre <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                placeholder="Ingresa tu nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group controlId="formEmail" className="mb-3">
              <Form.Label>Email <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="email"
                placeholder="Ingresa tu email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group controlId="formPassword" className="mb-3">
              <Form.Label>Contraseña <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="password"
                placeholder="Ingresa tu contraseña"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <Form.Text className="text-muted">
                La contraseña debe tener al menos 6 caracteres.
              </Form.Text>
            </Form.Group>

            <RegistrationImageUploader 
              onImageUploaded={handleImageUploaded}
              initialImage={formData.foto_perfil}
            />

            <Button 
              variant="primary" 
              type="submit" 
              className="w-100 mt-3"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Procesando...' : 'Registrarse'}
            </Button>
            
            <div className="text-center mt-3">
              <p>
                ¿Ya tienes cuenta? <Link to="/login">Iniciar sesión</Link>
              </p>
            </div>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default RegisterPage;