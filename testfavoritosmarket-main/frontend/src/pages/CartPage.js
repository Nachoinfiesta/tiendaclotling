import React from 'react';
import { Container, Table, Button, Form, Row, Col } from 'react-bootstrap';
import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';

const CartPage = () => {
  const { cart, removeFromCart, updateQuantity, clearCart, total } = useCart();
  const navigate = useNavigate();

  // Si el carrito está vacío
  if (cart.length === 0) {
    return (
      <Container className="my-5 py-3">
        <div className="text-center">
          <span className="fs-1">🛒</span>
          <h2>Tu carrito está vacío</h2>
          <p className="text-muted">¿No sabes qué comprar? ¡Miles de productos te esperan!</p>
          <Button 
            variant="primary" 
            className="mt-3"
            onClick={() => navigate('/')}
          >
            ← Ir a comprar
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <Container className="my-5">
      <h1 className="mb-4">Tu Carrito</h1>
      
      <Table responsive hover>
        <thead className="bg-light">
          <tr>
            <th>Producto</th>
            <th>Precio</th>
            <th>Cantidad</th>
            <th>Subtotal</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {cart.map(item => (
            <tr key={item.id} className="align-middle">
              <td>
                <div className="d-flex align-items-center">
                  <img 
                    src={item.image} 
                    alt={item.title} 
                    style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                    className="me-3"
                  />
                  <Link to={`/post/${item.id}`} className="text-decoration-none text-dark">
                    {item.title}
                  </Link>
                </div>
              </td>
              <td>${item.price.toFixed(2)}</td>
              <td style={{ width: '150px' }}>
                <Form.Control
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                  className="form-control-sm"
                />
              </td>
              <td>${(item.price * item.quantity).toFixed(2)}</td>
              <td>
                <Button 
                  variant="danger" 
                  size="sm"
                  onClick={() => removeFromCart(item.id)}
                >
                  🗑️
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      
      <Row className="mt-4">
        <Col md={6}>
          <Button 
            variant="outline-danger" 
            onClick={clearCart}
          >
            Vaciar carrito
          </Button>
        </Col>
        <Col md={6}>
          <div className="bg-light p-4 rounded">
            <div className="d-flex justify-content-between mb-2">
              <span>Subtotal:</span>
              <strong>${total.toFixed(2)}</strong>
            </div>
            <div className="d-flex justify-content-between mb-3">
              <span>Envío:</span>
              <span>Gratis</span>
            </div>
            <hr />
            <div className="d-flex justify-content-between mb-4">
              <h5>Total:</h5>
              <h5>${total.toFixed(2)}</h5>
            </div>
            <Button 
              variant="success" 
              className="w-100"
              onClick={() => navigate('/checkout')}
            >
              Proceder al pago
            </Button>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default CartPage;
