import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';

const AboutPage = () => {
  return (
    <Container className="my-5">
      <h1 className="text-center mb-5">Acerca de FavoritosMarket</h1>
      
      <Row className="mb-5">
        <Col md={6} className="mb-4 mb-md-0">
          <img 
            src="/Logo-market.png" 
            alt="FavoritosMarket Logo" 
            className="img-fluid rounded"
            style={{ maxHeight: '300px' }}
          />
        </Col>
        <Col md={6}>
          <h2>Nuestra misión</h2>
          <p className="lead">
            FavoritosMarket es una plataforma de comercio electrónico diseñada para conectar compradores y vendedores 
            de manera fácil, segura y confiable.
          </p>
          <p>
            Buscamos facilitar la compra y venta de productos, ofreciendo una experiencia de usuario 
            intuitiva y herramientas que hagan del comercio electrónico una actividad accesible para todos.
          </p>
        </Col>
      </Row>
      
      <h2 className="text-center mb-4">Nuestros valores</h2>
      <Row>
        <Col md={4} className="mb-4">
          <Card className="h-100">
            <Card.Body className="text-center">
              <h3>Confianza</h3>
              <p>Priorizamos la seguridad y transparencia en todas las transacciones.</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-4">
          <Card className="h-100">
            <Card.Body className="text-center">
              <h3>Comunidad</h3>
              <p>Creamos un espacio donde vendedores y compradores pueden prosperar juntos.</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-4">
          <Card className="h-100">
            <Card.Body className="text-center">
              <h3>Innovación</h3>
              <p>Constantemente mejoramos nuestra plataforma para ofrecer la mejor experiencia.</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AboutPage;