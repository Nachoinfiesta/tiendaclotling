import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import PostCard from '../components/PostCard';
import axios from 'axios';
import { UserContext } from '../context/UserContext';

const PostsGalleryPage = () => {
  const [posts, setPosts] = useState([]);
  const { user } = useContext(UserContext);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get('/api/posts');
        setPosts(response.data);
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    };

    fetchPosts();
  }, []);

  const handleViewDetail = (postId) => {
    console.log('Viewing detail for post:', postId);
  };

  const handleFavorite = async (postId) => {
    try {
      if (!user?.token) {
        alert('Debes iniciar sesión para guardar favoritos');
        return;
      }

      if (!postId) {
        console.error('Post ID is missing:', postId);
        alert('Error: ID de publicación no válido');
        return;
      }

      // Debug log before making the request
      console.log('Sending favorite request:', {
        postId,
        type: typeof postId,
        userId: user.id,
        tokenPresente: !!user.token
      });

      const response = await axios.post(
        '/api/favorites',
        {
          publicacion_id: Number(postId)
          // No incluir usuario_id, lo obtendremos del token en el backend
        },
        {
          headers: {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Favorite response:', response.data);
      alert(response.data.added ? 'Añadido a favoritos exitosamente' : 'Eliminado de favoritos exitosamente');
    } catch (error) {
      console.error('Error details:', {
        error,
        response: error.response?.data,
        postId
      });
      alert(error.response?.data?.error || 'Error al añadir a favoritos');
    }
  };

  return (
    <Container className="mt-5">
      <h1>Galería de Publicaciones</h1>
      <Row>
        {posts.map(post => {
          // Debug log for each post being rendered
          console.log('Rendering post:', {
            id: post.id,
            type: typeof post.id
          });
          
          return (
            <Col key={`post-${post.id}`} xs={12} sm={6} md={4} lg={3}>
              <PostCard
                id={Number(post.id)}
                title={post.titulo}
                description={post.descripcion}
                price={parseFloat(post.precio)}
                image={post.imagen}
                onClick={() => handleViewDetail(post.id)}
                onFavorite={() => handleFavorite(post.id)}
              />
            </Col>
          );
        })}
      </Row>
    </Container>
  );
};

export default PostsGalleryPage;