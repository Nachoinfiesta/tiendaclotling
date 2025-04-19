import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const Footer = () => {
  return (
    <footer className="bg-dark text-light py-4 mt-auto">
      <Container>
        <Row>
          <Col md={6} className="text-center text-md-start">
            <p>&copy; {new Date().getFullYear()} MiMarketPlace. Todos los derechos reservados.</p>
          </Col>
          <Col md={6} className="text-center text-md-end">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-light me-3">
              Facebook
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-light me-3">
              Twitter
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-light">
              Instagram
            </a>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;