import React, { useState, useContext } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert } from 'react-bootstrap';
import { useCart } from '../context/CartContext';
import { UserContext } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';

const CheckoutPage = () => {
  const { cart, total, clearCart } = useCart();
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: user?.email || '',
    address: '',
    city: '',
    zip: '',
    cardName: '',
    cardNumber: '',
    expDate: '',
    cvv: ''
  });
  
  const [validated, setValidated] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);

  // Si no hay productos en el carrito, redirigir a la página del carrito
  if (cart.length === 0 && !orderComplete) {
    navigate('/cart');
    return null;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    
    if (form.checkValidity() === false) {
      event.stopPropagation();
      setValidated(true);
      return;
    }
    
    // Aquí iría la lógica real para procesar el pago
    // Por ahora, simularemos un pago exitoso
    setTimeout(() => {
      setOrderComplete(true);
      clearCart();
    }, 1500);
  };

  if (orderComplete) {
    return (
      <Container className="my-5 text-center">
        <Alert variant="success" className="p-5">
          <h1>¡Pedido Completado!</h1>
          <p className="lead mt-3">Gracias por tu compra. Hemos enviado los detalles a tu correo electrónico.</p>
          <Button 
            variant="primary" 
            className="mt-4"
            onClick={() => navigate('/')}
          >
            Volver a la tienda
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="my-5">
      <h1 className="mb-4">Checkout</h1>
      
      <Row>
        <Col md={8}>
          <Form noValidate validated={validated} onSubmit={handleSubmit}>
            <h4 className="mb-3">Información de Envío</h4>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="firstName">
                  <Form.Label>Nombre</Form.Label>
                  <Form.Control
                    required
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                  />
                  <Form.Control.Feedback type="invalid">
                    Por favor ingresa tu nombre.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="lastName">
                  <Form.Label>Apellido</Form.Label>
                  <Form.Control
                    required
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                  />
                  <Form.Control.Feedback type="invalid">
                    Por favor ingresa tu apellido.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3" controlId="email">
              <Form.Label>Email</Form.Label>
              <Form.Control
                required
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
              <Form.Control.Feedback type="invalid">
                Por favor ingresa un email válido.
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3" controlId="address">
              <Form.Label>Dirección</Form.Label>
              <Form.Control
                required
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
              />
              <Form.Control.Feedback type="invalid">
                Por favor ingresa tu dirección.
              </Form.Control.Feedback>
            </Form.Group>

            <Row className="mb-3">
              <Col md={8}>
                <Form.Group controlId="city">
                  <Form.Label>Ciudad</Form.Label>
                  <Form.Control
                    required
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                  />
                  <Form.Control.Feedback type="invalid">
                    Por favor ingresa tu ciudad.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="zip">
                  <Form.Label>Código Postal</Form.Label>
                  <Form.Control
                    required
                    type="text"
                    name="zip"
                    value={formData.zip}
                    onChange={handleChange}
                  />
                  <Form.Control.Feedback type="invalid">
                    Ingresa tu código postal.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <hr className="my-4" />

            <h4 className="mb-3">Información de Pago</h4>
            <Form.Group className="mb-3" controlId="cardName">
              <Form.Label>Nombre en la tarjeta</Form.Label>
              <Form.Control
                required
                type="text"
                name="cardName"
                value={formData.cardName}
                onChange={handleChange}
              />
              <Form.Control.Feedback type="invalid">
                El nombre en la tarjeta es obligatorio.
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3" controlId="cardNumber">
              <Form.Label>Número de tarjeta</Form.Label>
              <Form.Control
                required
                type="text"
                name="cardNumber"
                value={formData.cardNumber}
                onChange={handleChange}
              />
              <Form.Control.Feedback type="invalid">
                El número de tarjeta es obligatorio.
              </Form.Control.Feedback>
            </Form.Group>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="expDate">
                  <Form.Label>Fecha de vencimiento</Form.Label>
                  <Form.Control
                    required
                    type="text"
                    name="expDate"
                    placeholder="MM/AA"
                    value={formData.expDate}
                    onChange={handleChange}
                  />
                  <Form.Control.Feedback type="invalid">
                    La fecha de vencimiento es obligatoria.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="cvv">
                  <Form.Label>CVV</Form.Label>
                  <Form.Control
                    required
                    type="text"
                    name="cvv"
                    value={formData.cvv}
                    onChange={handleChange}
                  />
                  <Form.Control.Feedback type="invalid">
                    El código de seguridad es obligatorio.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Button variant="primary" type="submit" className="w-100 mt-4" size="lg">
              Completar Compra
            </Button>
          </Form>
        </Col>
        
        <Col md={4}>
          <Card className="mb-4">
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">Resumen de la Compra</h5>
            </Card.Header>
            <Card.Body>
              {cart.map(item => (
                <div key={item.id} className="d-flex justify-content-between mb-2">
                  <span>{item.title.substring(0, 20)}{item.title.length > 20 ? '...' : ''} x {item.quantity}</span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <hr />
              <div className="d-flex justify-content-between">
                <strong>Total</strong>
                <strong>${total.toFixed(2)}</strong>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CheckoutPage;
