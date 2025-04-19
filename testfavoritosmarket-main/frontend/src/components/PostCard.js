import React, { useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Button, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import { useCart } from '../context/CartContext';
import axios from 'axios';

const StyledCard = styled.div`
  border: 1px solid #ddd;
  padding: 16px;
  margin-bottom: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease-in-out;
  height: 100%;
  display: flex;
  flex-direction: column;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
`;

const ImageContainer = styled.div`
  width: 100%;
  height: 200px;
  overflow: hidden;
  border-radius: 6px;
  margin-bottom: 12px;
  position: relative;
`;

const ProductImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
  
  &:hover {
    transform: scale(1.05);
  }
`;

const PostCard = ({ id, title, price, description, image, onFavorite, onClaim }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isInCart, setIsInCart] = useState(false);
  const { user } = useContext(UserContext);
  const { cart, addToCart, removeFromCart } = useCart();
  const navigate = useNavigate();
  
  useEffect(() => {
    const productInCart = cart.find(item => item.id === id);
    setIsInCart(!!productInCart);
  }, [cart, id]);
  
  useEffect(() => {
    if (!user) return;

    const checkFavorite = async () => {
      try {
        const response = await axios.get(`/api/favorites/check/${id}`, {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        });
        setIsFavorite(response.data.isFavorite);
      } catch (error) {
        console.error('Error al verificar favorito:', error);
      }
    };

    checkFavorite();
  }, [id, user]);

  const toggleFavorite = async (e) => {
    e.stopPropagation();
    
    if (!user?.token) {
      alert('Debes iniciar sesión para añadir a favoritos');
      return;
    }

    try {
      const claimResponse = await axios.post(
        '/api/favorites',
        { publicacion_id: id },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setIsFavorite(!isFavorite);
      
      if (onFavorite) {
        onFavorite(id, !isFavorite);
      }
    } catch (error) {
      console.error('Error al gestionar favorito:', error);
      alert('Error al gestionar favorito');
    }
  };

  const handleClaim = async (e) => {
    e.stopPropagation();

    if (!user?.token) {
      alert('Debes iniciar sesión para reclamar esta publicación');
      return;
    }

    try {
      const claimResponse = await axios.put(`/api/posts/claim/${id}`, {}, {
        headers: { 
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Publicación reclamada:', claimResponse.data);
      
      alert('Publicación reclamada exitosamente');
      
      if (onClaim) {
        onClaim(id);
      }
    } catch (error) {
      console.error('Error al reclamar publicación:', error.response?.data || error);
      alert(error.response?.data?.error || 'Error al reclamar la publicación');
    }
  };
  
  const handleCartAction = (e) => {
    e.stopPropagation();
    
    const product = {
      id,
      title,
      description,
      price,
      image,
      quantity: 1
    };
    
    if (isInCart) {
      removeFromCart(id);
      
      const tempAlert = document.createElement('div');
      tempAlert.className = 'position-fixed bottom-0 end-0 p-3';
      tempAlert.style.zIndex = 1050;
      tempAlert.innerHTML = `
        <div class="toast show" role="alert">
          <div class="toast-body bg-info text-white">
            ✓ Producto eliminado del carrito
          </div>
        </div>
      `;
      document.body.appendChild(tempAlert);
      setTimeout(() => document.body.removeChild(tempAlert), 2000);
    } else {
      addToCart(product);
      
      const tempAlert = document.createElement('div');
      tempAlert.className = 'position-fixed bottom-0 end-0 p-3';
      tempAlert.style.zIndex = 1050;
      tempAlert.innerHTML = `
        <div class="toast show" role="alert">
          <div class="toast-body bg-success text-white">
            ✓ Producto añadido al carrito
          </div>
        </div>
      `;
      document.body.appendChild(tempAlert);
      setTimeout(() => document.body.removeChild(tempAlert), 2000);
    }
  };

  return (
    <StyledCard>
      <ImageContainer>
        <ProductImage src={image} alt={title} />
        {isInCart && (
          <Badge 
            bg="success" 
            className="position-absolute top-0 end-0 m-2 p-2"
            style={{ zIndex: 10 }}
          >
            En Carrito
          </Badge>
        )}
      </ImageContainer>
      <h3>{title}</h3>
      <p>{description.length > 100 ? `${description.substring(0, 100)}...` : description}</p>
      <p><strong>Precio:</strong> ${price}</p>
      <div className="d-flex gap-2 flex-wrap">
        <Button variant="outline-primary" onClick={() => navigate(`/post/${id}`)}>
          Ver Detalle
        </Button>
        
        <Button 
          variant={isInCart ? "success" : "primary"}
          onClick={handleCartAction}
        >
          {isInCart ? '✓ En Carrito' : '🛒 Añadir al carrito'}
        </Button>
        
        {user && (
          <Button
            variant={isFavorite ? "warning" : "outline-warning"}
            onClick={toggleFavorite}
            className={isFavorite ? "favorite-active" : ""}
          >
            {isFavorite ? '💖 Favorito' : '🤍 Favorito'}
          </Button>
        )}
        
        {onClaim && user && (
          <Button 
            variant="outline-success"
            onClick={handleClaim}
          >
            ✋ Reclamar
          </Button>
        )}
      </div>
    </StyledCard>
  );
};

PostCard.propTypes = {
  id: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
  price: PropTypes.number.isRequired,
  description: PropTypes.string.isRequired,
  image: PropTypes.string.isRequired,
  onClaim: PropTypes.func,
  onFavorite: PropTypes.func
};

export default PostCard;
