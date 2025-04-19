import React, { useState, useContext, useEffect } from 'react';
import { Container, Form, Button, Alert, Row, Col } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { UserContext } from '../context/UserContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(UserContext);
  const navigate = useNavigate();
  const location = useLocation();

  // Comprobar si hay un mensaje de sesión expirada
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('expired') === 'true') {
      setError('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validación básica
    if (!email || !password) {
      setError('Por favor ingresa email y contraseña');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      console.log('Intentando iniciar sesión con:', { email });
      
      // Realizar solicitud de login
      const response = await axios.post('/api/auth/login', {
        email,
        password
      });

      console.log('Respuesta de login:', response.data);
      
      // Verificar si recibimos un token y datos de usuario
      if (response.data && response.data.token && response.data.user) {
        // Guardar datos en el contexto
        login(response.data);
        
        // Redirigir al usuario
        navigate('/');
      } else {
        setError('Respuesta de servidor inválida');
      }
    } catch (err) {
      console.error('Error en login:', err);
      
      if (err.response) {
        // El servidor respondió con un código de estado de error
        console.error('Datos de respuesta:', err.response.data);
        setError(err.response.data.error || 'Credenciales inválidas');
      } else if (err.request) {
        // La solicitud se hizo pero no se recibió respuesta
        setError('No se pudo conectar con el servidor');
      } else {
        // Error al configurar la solicitud
        setError(`Error: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-md-center">
        <Col md={6}>
          <div className="text-center mb-4">
            <h1>Iniciar Sesión</h1>
          </div>

          {error && <Alert variant="danger">{error}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="formBasicEmail" className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Ingresa tu email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group controlId="formBasicPassword" className="mb-3">
              <Form.Label>Contraseña</Form.Label>
              <Form.Control
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Form.Group>

            <Button 
              variant="primary" 
              type="submit" 
              className="w-100" 
              disabled={loading}
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>

            <div className="text-center mt-3">
              <p>
                ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
              </p>
            </div>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default LoginPage;