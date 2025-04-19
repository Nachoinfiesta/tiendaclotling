import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Alert, Spinner, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import PostCard from '../components/PostCard';
import axios from 'axios';

const MyPostsPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useContext(UserContext);

  useEffect(() => {
    const fetchUserPosts = async () => {
      if (!user?.token) {
        setError('Debes iniciar sesión para ver tus publicaciones');
        setLoading(false);
        return;
      }

      try {
        // Verificar que el ID de usuario existe antes de hacer la petición
        if (!user.id) {
          console.error('ID de usuario no disponible');
          setError('Información de usuario incompleta. Por favor, inicia sesión nuevamente.');
          setLoading(false);
          return;
        }
        
        console.log('Obteniendo publicaciones del usuario con ID:', user.id);
        
        // URL específica para obtener publicaciones del usuario
        const response = await axios.get(`/api/posts/user/${user.id}`, {
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
        });

        console.log('Datos recibidos de publicaciones:', response.data);
        setPosts(Array.isArray(response.data) ? response.data : []);
        
        // Si no hay publicaciones, intentar también con usuario_id = null para proponer reclamar
        if (response.data.length === 0) {
          console.log('Consultando publicaciones sin dueño para reclamar');
          try {
            const orphanPosts = await axios.get('/api/posts');
            const unclaimedPosts = orphanPosts.data.filter(post => !post.usuario_id);
            
            if (unclaimedPosts.length > 0) {
              console.log(`Encontradas ${unclaimedPosts.length} publicaciones sin dueño`);
              // No establecemos aquí, solo generamos un mensaje de ayuda
            }
          } catch (orphanError) {
            console.warn('Error al buscar publicaciones sin dueño:', orphanError);
            // No mostramos este error al usuario
          }
        }
        
        setError(null);
      } catch (err) {
        console.error('Error al obtener publicaciones:', err);
        
        if (err.response?.status === 401) {
          setError('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
        } else {
          setError('Error al cargar tus publicaciones. Intenta de nuevo más tarde.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserPosts();
  }, [user]);

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

  if (!user) {
    return (
      <Container className="mt-5">
        <Alert variant="warning">
          Debes iniciar sesión para ver tus publicaciones
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Mis Publicaciones</h1>
        <div>
          <Button 
            as={Link} 
            to="/claim-posts"
            variant="outline-info"
            className="me-2"
          >
            Reclamar Publicaciones
          </Button>
          <Button 
            as={Link} 
            to="/create-post"
            variant="primary"
          >
            Crear Nueva Publicación
          </Button>
        </div>
      </div>

      {posts.length === 0 ? (
        <Alert variant="info">
          No tienes publicaciones asociadas a tu cuenta. Puedes crear una nueva publicación o reclamar 
          publicaciones existentes si eres el creador original.
          <div className="mt-3">
            <Button as={Link} to="/claim-posts" variant="info" className="me-2">
              Reclamar Publicaciones
            </Button>
            <Button as={Link} to="/create-post" variant="primary">
              Crear Nueva Publicación
            </Button>
          </div>
        </Alert>
      ) : (
        <Row>
          {posts.map(post => (
            <Col key={post.id} xs={12} sm={6} md={4} lg={3}>
              <PostCard
                id={post.id}
                title={post.titulo}
                description={post.descripcion}
                price={parseFloat(post.precio)}
                image={post.imagen}
              />
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default MyPostsPage;
