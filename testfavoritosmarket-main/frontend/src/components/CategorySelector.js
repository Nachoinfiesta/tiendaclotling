import React, { useState, useEffect } from 'react';
import { Form, Spinner } from 'react-bootstrap';
import axios from 'axios';

const CategorySelector = ({ value, onChange, isRequired = true }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/categories');
        setCategories(response.data);
        setError('');
      } catch (err) {
        console.error('Error al cargar categorías:', err);
        setError('No se pudieron cargar las categorías');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="text-center">
        <Spinner animation="border" size="sm" />
        <span className="ms-2">Cargando categorías...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Form.Group className="mb-3">
        <Form.Label>Categoría</Form.Label>
        <Form.Control as="select" disabled>
          <option>Error al cargar categorías</option>
        </Form.Control>
        <Form.Text className="text-danger">{error}</Form.Text>
      </Form.Group>
    );
  }

  return (
    <Form.Group className="mb-3">
      <Form.Label>Categoría</Form.Label>
      <Form.Select 
        value={value} 
        onChange={onChange}
        required={isRequired}
      >
        <option value="">Selecciona una categoría</option>
        {categories.map(category => (
          <option key={category.id} value={category.id}>
            {category.nombre}
          </option>
        ))}
      </Form.Select>
    </Form.Group>
  );
};

export default CategorySelector;
