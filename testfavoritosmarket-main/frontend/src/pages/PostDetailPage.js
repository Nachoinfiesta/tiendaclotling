import React, { useState, useEffect, useContext } from 'react';
// Quitar Card de las importaciones si no se usa
import { Container, Row, Col, Button, Badge, Spinner, Alert } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserContext } from '../context/UserContext';
import { useCart } from '../context/CartContext';

const PostDetailPage = () => {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const { addToCart } = useCart(); // Importamos la función para añadir al carrito
  const [addedToCart, setAddedToCart] = useState(false); // Estado para mostrar mensaje de confirmación

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axios.get(`/api/posts/${id}`);
        setPost(response.data);
        setLoading(false);
      } catch (err) {
        setError('Error al cargar la publicación');
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  // Función para añadir el producto al carrito
  const handleAddToCart = () => {
    if (post) {
      const productToAdd = {
        id: post.id,
        title: post.titulo,
        description: post.descripcion,
        price: parseFloat(post.precio),
        image: post.imagen,
        quantity: 1
      };
      
      addToCart(productToAdd);
      setAddedToCart(true);
      
      // Ocultar el mensaje después de 3 segundos
      setTimeout(() => {
        setAddedToCart(false);
      }, 3000);
    }
  };

  if (loading) {
    return (
      <Container className="text-center my-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="my-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  if (!post) {
    return (
      <Container className="my-5">
        <Alert variant="warning">Publicación no encontrada</Alert>
      </Container>
    );
  }

  return (
    <Container className="my-5">
      {addedToCart && (
        <Alert variant="success" className="mb-3">
          ¡Producto añadido al carrito con éxito!
        </Alert>
      )}
      
      <Row>
        <Col md={6}>
          <img 
            src={post.imagen} 
            alt={post.titulo} 
            className="img-fluid rounded"
            style={{ maxHeight: '500px', objectFit: 'contain' }}
          />
        </Col>
        <Col md={6}>
          <h1>{post.titulo}</h1>
          <Badge bg="secondary" className="mb-3">{post.categoria}</Badge>
          <h3 className="text-success">${parseFloat(post.precio).toFixed(2)}</h3>
          <p className="my-4">{post.descripcion}</p>
          
          <div className="d-grid gap-2">
            <Button 
              variant="primary" 
              size="lg"
              onClick={handleAddToCart}
            >
              🛒 Agregar al carrito
            </Button>
            
            <Button 
              variant="outline-secondary"
              onClick={() => navigate(-1)}
            >
              ⬅️ Volver
            </Button>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default PostDetailPage;