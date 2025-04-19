import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../context/UserContext';
import { Container, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import CategorySelector from '../components/CategorySelector';
import ImageUploader from '../components/ImageUploader'; // Importamos el componente

const EditPostPage = () => {
  const { id } = useParams();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  // Cargar los datos de la publicación
  useEffect(() => {
    const fetchPostData = async () => {
      if (!user?.token) {
        setError('Debes iniciar sesión para editar una publicación');
        setLoading(false);
        return;
      }

      try {
        let userId = user.id;
        
        if (!userId) {
          const storedUser = JSON.parse(localStorage.getItem('user'));
          userId = storedUser?.id;
          console.log('ID recuperado desde localStorage:', userId);
        }
        
        const response = await axios.get(`/api/posts/${id}`, {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        });

        const post = response.data;
        
        if (!post) {
          setError('No se encontró la publicación');
          setLoading(false);
          return;
        }
        
        console.log('Datos del post recibidos:', post);
        console.log('Usuario actual ID:', userId);
        console.log('ID del usuario del post:', post.usuario_id);
        
        if (userId === undefined) {
          console.log('ID de usuario no disponible en el frontend, continuando...');
          setTitle(post.titulo || '');
          setDescription(post.descripcion || '');
          setCategoryId(post.categoria_id || '');
          setPrice(post.precio ? post.precio.toString() : '');
          setImage(post.imagen || '');
          setError('');
          setLoading(false);
          return;
        }
        
        const postUserId = parseInt(post.usuario_id);
        const currentUserId = parseInt(userId);
        
        if (postUserId !== currentUserId) {
          setError('No tienes permiso para editar esta publicación');
          setLoading(false);
          return;
        }

        setTitle(post.titulo || '');
        setDescription(post.descripcion || '');
        setCategoryId(post.categoria_id || '');
        setPrice(post.precio ? post.precio.toString() : '');
        setImage(post.imagen || '');
        
        setError('');
        setLoading(false);
      } catch (err) {
        console.error('Error al cargar la publicación:', err);
        setError('No se pudo cargar la información de la publicación');
        setLoading(false);
      }
    };

    fetchPostData();
  }, [id, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user?.token) {
      alert('Debes iniciar sesión para editar una publicación');
      return;
    }

    if (!title || !description || !categoryId || !price || !image) {
      setError('Todos los campos son obligatorios.');
      return;
    }

    if (parseFloat(price) <= 0) {
      setError('El precio debe ser un número positivo.');
      return;
    }

    const dataToSend = {
      titulo: title,
      descripcion: description,
      categoria_id: categoryId,
      precio: parseFloat(price),
      imagen: image,
    };

    try {
      const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      
      console.log(`Enviando solicitud a: ${baseUrl}/posts/update/${id}`);
      
      const response = await fetch(`${baseUrl}/posts/update/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend)
      });
      
      console.log(`Respuesta recibida con código: ${response.status}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log("Respuesta del servidor:", data);
      
      setSuccess(true);
      setError(null);

      setTimeout(() => {
        navigate('/my-posts');
      }, 2000);
    } catch (err) {
      console.error('Error editando la publicación:', err);
      setError(`Ocurrió un error al editar la publicación: ${err.message}`);
      setSuccess(false);
    }
  };

  // Manejador para la imagen subida
  const handleImageUploaded = (imageUrl) => {
    setImage(imageUrl);
  };

  return (
    <Container className="mt-5">
      <h1 className="text-center mb-4">Editar Publicación</h1>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">Publicación actualizada exitosamente. Redirigiendo...</Alert>}

      {loading ? (
        <Container className="mt-5 text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Cargando...</span>
          </Spinner>
        </Container>
      ) : !error ? (
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="formTitle" className="mb-3">
            <Form.Label>Título</Form.Label>
            <Form.Control
              type="text"
              placeholder="Ingresa el título de la publicación"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group controlId="formDescription" className="mb-3">
            <Form.Label>Descripción</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Ingresa la descripción de la publicación"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </Form.Group>

          <CategorySelector 
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          />

          <Form.Group controlId="formPrice" className="mb-3">
            <Form.Label>Precio</Form.Label>
            <Form.Control
              type="number"
              step="0.01"
              placeholder="Ingresa el precio de la publicación"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </Form.Group>

          {/* Reemplazamos el campo de imagen con ImageUploader */}
          <ImageUploader 
            onImageUploaded={handleImageUploaded}
            initialImage={image}
          />

          <div className="d-flex justify-content-between">
            <Button variant="secondary" onClick={() => navigate('/my-posts')} className="me-2">
              Cancelar
            </Button>
            <Button variant="primary" type="submit">
              Actualizar Publicación
            </Button>
          </div>
        </Form>
      ) : (
        <div className="text-center mt-4">
          <Button variant="primary" onClick={() => navigate('/my-posts')}>
            Volver a Mis Publicaciones
          </Button>
        </div>
      )}
    </Container>
  );
};

export default EditPostPage;
