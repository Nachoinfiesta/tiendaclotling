import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Alert, Button, Form, ButtonGroup } from 'react-bootstrap'; // Eliminar Spinner
import { useSearchParams, useNavigate } from 'react-router-dom';
import PostCard from '../components/PostCard';
import axios from 'axios';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import { FaSearch, FaThList, FaThLarge } from 'react-icons/fa';

const FilterSection = styled.div`
  background: white;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 2rem;
`;

const ResultCount = styled.p`
  font-size: 0.9rem;
  color: #666;
  margin: 1rem 0;
`;

const SearchResultsPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('recent');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState([]);
  const query = searchParams.get('q');

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    // Cargar categorías
    const fetchCategories = async () => {
      try {
        const response = await axios.get('/api/categories');
        setCategories(response.data);
      } catch (err) {
        console.error('Error al cargar categorías:', err);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/posts/search?q=${encodeURIComponent(query)}`);
        let sortedResults = [...response.data];

        // Aplicar ordenamiento
        switch(sortBy) {
          case 'price_asc':
            sortedResults.sort((a, b) => a.precio - b.precio);
            break;
          case 'price_desc':
            sortedResults.sort((a, b) => b.precio - a.precio);
            break;
          case 'recent':
            sortedResults.sort((a, b) => new Date(b.fecha_creacion) - new Date(a.fecha_creacion));
            break;
          default:
            // Caso por defecto: ordenar por fecha más reciente
            sortedResults.sort((a, b) => new Date(b.fecha_creacion) - new Date(a.fecha_creacion));
            break;
        }

        // Aplicar filtros de precio
        if (priceRange.min || priceRange.max) {
          sortedResults = sortedResults.filter(item => {
            const price = Number(item.precio);
            return (!priceRange.min || price >= Number(priceRange.min)) &&
                   (!priceRange.max || price <= Number(priceRange.max));
          });
        }

        // Aplicar filtro de categoría
        if (categoryId) {
          sortedResults = sortedResults.filter(item => item.categoria_id === parseInt(categoryId));
        }

        setResults(sortedResults);
      } catch (err) {
        setError('Error al buscar publicaciones');
      } finally {
        setLoading(false);
      }
    };

    if (query) {
      fetchResults();
    }
  }, [query, sortBy, priceRange, categoryId]);

  // Calcular páginas
  const totalPages = Math.ceil(results.length / itemsPerPage);
  const currentResults = results.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  return (
    <Container className="mt-4">
      <h2 className="mb-4">Resultados para "{query}"</h2>
      
      <FilterSection>
        <Row className="align-items-center">
          <Col md={3}>
            <Form.Select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="mb-2"
            >
              <option value="recent">Más recientes</option>
              <option value="price_asc">Precio: Menor a Mayor</option>
              <option value="price_desc">Precio: Mayor a Menor</option>
            </Form.Select>
          </Col>
          <Col md={3}>
            <Form.Select 
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="mb-2"
            >
              <option value="">Todas las categorías</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.nombre}</option>
              ))}
            </Form.Select>
          </Col>
          <Col md={4}>
            <Row>
              <Col>
                <Form.Control
                  type="number"
                  placeholder="Precio min"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange({...priceRange, min: e.target.value})}
                  className="mb-2"
                />
              </Col>
              <Col>
                <Form.Control
                  type="number"
                  placeholder="Precio max"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange({...priceRange, max: e.target.value})}
                  className="mb-2"
                />
              </Col>
            </Row>
          </Col>
          <Col md={2}>
            <ButtonGroup className="w-100">
              <Button 
                variant={viewMode === 'grid' ? 'primary' : 'outline-primary'}
                onClick={() => setViewMode('grid')}
              >
                <i className="bi bi-grid"></i>
              </Button>
              <Button 
                variant={viewMode === 'list' ? 'primary' : 'outline-primary'}
                onClick={() => setViewMode('list')}
              >
                <i className="bi bi-list"></i>
              </Button>
            </ButtonGroup>
          </Col>
        </Row>
      </FilterSection>

      <ResultCount>
        {results.length} resultados encontrados
      </ResultCount>

      {loading ? (
        <Row>
          {[...Array(4)].map((_, i) => (
            <Col key={i} xs={12} sm={6} md={4} lg={3}>
              <div className="placeholder-glow">
                <div className="placeholder" style={{height: '200px'}}></div>
              </div>
            </Col>
          ))}
        </Row>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : (
        <>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <Row>
              {currentResults.map(post => (
                <Col 
                  key={post.id} 
                  xs={12} 
                  sm={viewMode === 'grid' ? 6 : 12} 
                  md={viewMode === 'grid' ? 4 : 12} 
                  lg={viewMode === 'grid' ? 3 : 12}
                >
                  <motion.div variants={itemVariants}>
                    <PostCard
                      id={post.id}
                      title={post.titulo}
                      description={post.descripcion}
                      price={Number(post.precio)}
                      image={post.imagen}
                      onClick={() => navigate(`/post/${post.id}`)}
                      viewMode={viewMode}
                    />
                  </motion.div>
                </Col>
              ))}
            </Row>
          </motion.div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-center mt-4">
              <ButtonGroup>
                {[...Array(totalPages)].map((_, i) => (
                  <Button
                    key={i + 1}
                    variant={currentPage === i + 1 ? 'primary' : 'outline-primary'}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </Button>
                ))}
              </ButtonGroup>
            </div>
          )}
        </>
      )}
    </Container>
  );
};

export default SearchResultsPage;
