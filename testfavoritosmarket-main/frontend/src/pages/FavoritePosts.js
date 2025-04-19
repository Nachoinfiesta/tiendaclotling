import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Container, Row, Col, Alert } from 'react-bootstrap';
import { UserContext } from '../context/UserContext';
import PostCard from '../components/PostCard';
import axios from 'axios';

const FavoritePosts = () => {
  const { user } = useContext(UserContext);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Usar useCallback para la función fetchFavorites
  const fetchFavorites = useCallback(async () => {
    if (!user?.token) {
      setError('Debes iniciar sesión para ver tus favoritos');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get('/api/favorites', {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });
      setFavorites(response.data);
      setError(null);
    } catch (err) {
      console.error('Error al obtener favoritos:', err);
      setError('Ocurrió un error al cargar tus favoritos');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]); // Ahora fetchFavorites es estable con useCallback

  // Función para manejar la eliminación de favoritos en tiempo real
  const handleFavoriteToggle = (postId, isFavorite) => {
    console.log(`Favorito cambiado: postId=${postId}, isFavorite=${isFavorite}`);
    
    if (!isFavorite) {
      // Si se desmarcó como favorito, eliminar de la lista local
      setFavorites(prevFavorites => 
        prevFavorites.filter(fav => fav.publicacion_id !== postId)
      );
    }
  };

  if (loading) {
    return <Container className="mt-5 text-center"><p>Cargando favoritos...</p></Container>;
  }

  if (error) {
    return <Container className="mt-5"><Alert variant="danger">{error}</Alert></Container>;
  }

  if (favorites.length === 0) {
    return (
      <Container className="mt-5">
        <Alert variant="info">
          No tienes publicaciones favoritas. Explora la galería para añadir favoritos.
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-5">
      <h1 className="mb-4">Mis Favoritos</h1>
      <Row>
        {favorites.map(favorite => (
          <Col key={`favorite-${favorite.publicacion_id}`} xs={12} sm={6} md={4} lg={3}>
            <PostCard
              id={favorite.publicacion_id}
              title={favorite.titulo}
              description={favorite.descripcion}
              price={parseFloat(favorite.precio)}
              image={favorite.imagen}
              onFavorite={handleFavoriteToggle}
            />
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default FavoritePosts;