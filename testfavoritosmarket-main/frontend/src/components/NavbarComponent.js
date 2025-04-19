import React, { useContext, useState } from 'react';
import { Navbar, Nav, Container, Button, Badge, Image, Form, InputGroup } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import { useCart } from '../context/CartContext';
import { FaSearch } from 'react-icons/fa';

const NavbarComponent = () => {
  const { user, logout } = useContext(UserContext);
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" sticky="top">
      <Container>
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
          <Image 
            src="/Logo-market.png"  
            alt="FavoritosMarket Logo"
            height="30"
            className="d-inline-block align-top me-2"
            onError={(e) => {
              e.target.onError = null;
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'inline';
            }}
          />
          <span style={{ display: 'none' }}>FavoritosMarket</span>
        </Navbar.Brand>
        
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">Inicio</Nav.Link>
            {user && (
              <>
                <Nav.Link as={Link} to="/create-post">Crear Publicación</Nav.Link>
                <Nav.Link as={Link} to="/my-posts">Mis Publicaciones</Nav.Link>
              </>
            )}
          </Nav>
          
          <Form className="d-flex mx-auto" onSubmit={handleSearch}>
            <InputGroup>
              <Form.Control
                type="search"
                placeholder="Buscar productos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Buscar"
                className="border-end-0"
              />
              <Button 
                variant="outline-light" 
                type="submit"
                className="d-flex align-items-center"
              >
                <FaSearch />
              </Button>
            </InputGroup>
          </Form>
          
          <Nav className="ms-auto">
            <Nav.Link as={Link} to="/cart" className="d-flex align-items-center">
              🛒 Carrito
              {itemCount > 0 && (
                <Badge bg="danger" pill className="ms-1">{itemCount}</Badge>
              )}
            </Nav.Link>
            
            {user ? (
              <>
                <Nav.Link as={Link} to="/favorites" className="d-flex align-items-center">
                  ❤️ Favoritos
                </Nav.Link>
                <Nav.Link as={Link} to="/profile" className="d-flex align-items-center">
                  👤 {user.nombre}
                </Nav.Link>
                <Button variant="outline-light" size="sm" onClick={handleLogout}>
                  Cerrar Sesión
                </Button>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">Iniciar Sesión</Nav.Link>
                <Nav.Link as={Link} to="/register">Registrarse</Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavbarComponent;
