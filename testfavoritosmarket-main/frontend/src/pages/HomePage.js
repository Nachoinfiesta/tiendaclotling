import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Alert, Spinner } from 'react-bootstrap';
import axios from 'axios';
import PostCard from '../components/PostCard';
import { UserContext } from '../context/UserContext';
import { useCart } from '../context/CartContext';

const HomePage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useContext(UserContext);
  const { cart } = useCart(); // Para refrescar cuando cambie el carrito

  useEffect(() => {
    // Crear un token de cancelación para evitar actualizaciones después de desmontar
    const source = axios.CancelToken.source();
    
    const fetchPosts = async () => {
      try {
        const response = await axios.get('/api/posts', {
          cancelToken: source.token
        });
        setPosts(response.data);
        setError(null);
      } catch (err) {
        if (axios.isCancel(err)) {
          console.log('Solicitud cancelada');
          return;
        }
        console.error('Error fetching posts:', err);
        setError('Error al cargar las publicaciones');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
    
    // Función de limpieza para cancelar la solicitud si el componente se desmonta
    return () => {
      source.cancel('Componente desmontado');
    };
  }, []);

  const handleClaimPost = async (postId) => {
    // Acceder a user desde el contexto, no como variable suelta
    if (!user) {
      console.error('Usuario no autenticado');
      return;
    }
    
    try {
      // Actualizar lista de publicaciones localmente después de reclamar
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post.id === postId 
            ? { ...post, usuario_id: user.id } 
            : post
        )
      );
    } catch (error) {
      console.error('Error actualizando lista después de reclamar:', error);
    }
  };

  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-5">
      <h1 className="mb-4">Publicaciones Recientes</h1>
      {posts.length === 0 ? (
        <Alert variant="info">No hay publicaciones disponibles.</Alert>
      ) : (
        <Row>
          {posts.map(post => (
            <Col key={post.id} xs={12} sm={6} md={4} lg={3} className="mb-4">
              <PostCard
                id={post.id}
                title={post.titulo}
                description={post.descripcion}
                price={parseFloat(post.precio)}
                image={post.imagen}
                // Añadir onClaim solo para publicaciones sin usuario_id y si el usuario está logueado
                onClaim={(user && !post.usuario_id) ? handleClaimPost : undefined}
              />
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default HomePage;