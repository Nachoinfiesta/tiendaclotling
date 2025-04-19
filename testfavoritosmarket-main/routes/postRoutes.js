const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const authMiddleware = require('../middlewares/authMiddleware');
const pool = require('../db'); // Añadir esta línea para importar la conexión a la BD

// Ruta para crear una nueva publicación
router.post('/create-post', authMiddleware, async (req, res) => {
  try {
    // Verifica explícitamente la información del usuario
    console.log('📝 POST /api/posts/create-post - Información de usuario:', req.user ? JSON.stringify(req.user) : 'No disponible');
    
    // Si no hay usuario autenticado, retornar error
    if (!req.user || !req.user.id) {
      console.error('❌ createPost - No hay usuario autenticado');
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    // Se procede con la creación de la publicación
    const { titulo, descripcion, precio, categoria_id, imagen } = req.body;

    console.log('📝 Datos recibidos para crear publicación:', {
      titulo, descripcion, precio, categoria_id, imagen: imagen ? '[IMAGEN PRESENTE]' : '[SIN IMAGEN]',
      usuario_id: req.user.id
    });

    // Validación de campos
    if (!titulo || !descripcion || !precio || !categoria_id) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    // Creación de la publicación
    const result = await pool.query(
      `INSERT INTO publicaciones (titulo, descripcion, precio, imagen, categoria_id, usuario_id) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [titulo, descripcion, precio, imagen, categoria_id, req.user.id]
    );

    console.log(`✅ Publicación creada exitosamente - ID: ${result.rows[0].id}`);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('❌ Error al crear publicación:', err);
    res.status(500).json({ error: 'Error al crear la publicación' });
  }
});

// Asegurar que la ruta para crear posts es consistente
// Agregar un alias para mantener compatibilidad con los tests
router.post('/create', authMiddleware, async (req, res) => {
  // Redirigir a la ruta existente
  req.url = '/create-post';
  router.handle(req, res);
});

// Obtener publicaciones del usuario autenticado (protegida)
router.get('/user-posts', authMiddleware, postController.getUserPosts);

// Obtener todas las publicaciones (público)
router.get('/', postController.getAllPosts);

// Rutas para búsqueda y actualización
router.get('/search', postController.searchPosts);
router.put('/update/:id', authMiddleware, postController.updatePost);
// También podemos habilitar la ruta con formato tradicional
router.put('/:id', authMiddleware, postController.updatePost);

// Ruta para obtener publicaciones de un usuario específico
router.get('/user/:userId', authMiddleware, async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log(`🔍 Buscando publicaciones para el usuario ${userId}`);
    
    // Consulta SQL para las publicaciones del usuario
    const result = await pool.query(
      `SELECT p.*, c.nombre as categoria_nombre 
       FROM publicaciones p
       LEFT JOIN categorias c ON p.categoria_id = c.id
       WHERE p.usuario_id = $1
       ORDER BY p.fecha_creacion DESC`, 
      [userId]
    );
    
    console.log(`✅ Encontradas ${result.rows.length} publicaciones para el usuario ${userId}`);
    
    // CONSULTA DE DEPURACIÓN: Mostrar todas las publicaciones y sus usuarios
    const allPosts = await pool.query(
      'SELECT id, usuario_id, titulo FROM publicaciones ORDER BY id'
    );
    
    console.log('📊 Todas las publicaciones en la BD:');
    allPosts.rows.forEach(post => {
      console.log(`ID: ${post.id}, Usuario: ${post.usuario_id || 'NULL'}, Título: ${post.titulo}`);
    });
    
    res.json(result.rows);
  } catch (err) {
    console.error('❌ Error al obtener publicaciones del usuario:', err);
    res.status(500).json({ error: 'Error al obtener publicaciones' });
  }
});

// Nueva ruta para asociar una publicación al usuario actual
router.put('/claim/:postId', authMiddleware, async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;
    
    console.log(`🔄 Intentando asociar la publicación ${postId} al usuario ${userId}`);
    
    // Verificar primero que la publicación existe y no tiene un usuario asignado
    const checkResult = await pool.query(
      'SELECT * FROM publicaciones WHERE id = $1',
      [postId]
    );
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Publicación no encontrada' });
    }
    
    const post = checkResult.rows[0];
    if (post.usuario_id) {
      return res.status(403).json({ 
        error: 'Esta publicación ya está asociada con un usuario',
        currentOwnerId: post.usuario_id
      });
    }
    
    // Asociar la publicación al usuario actual
    const updateResult = await pool.query(
      'UPDATE publicaciones SET usuario_id = $1 WHERE id = $2 RETURNING *',
      [userId, postId]
    );
    
    console.log(`✅ Publicación ${postId} asociada exitosamente al usuario ${userId}`);
    
    res.json({
      success: true,
      message: 'Publicación reclamada exitosamente',
      post: updateResult.rows[0]
    });
  } catch (err) {
    console.error('❌ Error al reclamar publicación:', err);
    res.status(500).json({ error: 'Error al procesar la solicitud' });
  }
});

// Nueva ruta para toggle favorito (agregar/quitar de favoritos)
router.post('/favorite', authMiddleware, async (req, res) => {
  try {
    const { publicacion_id } = req.body;
    const usuario_id = req.user.id;

    console.log('📩 Toggle favorito:', { usuario_id, publicacion_id });

    if (!publicacion_id) {
      return res.status(400).json({ error: 'El ID de la publicación es obligatorio.' });
    }

    // Verificar si ya está en favoritos
    const check = await pool.query(
      'SELECT * FROM favoritos WHERE usuario_id = $1 AND publicacion_id = $2',
      [usuario_id, publicacion_id]
    );

    if (check.rows.length > 0) {
      // Si existe, eliminar
      await pool.query(
        'DELETE FROM favoritos WHERE usuario_id = $1 AND publicacion_id = $2',
        [usuario_id, publicacion_id]
      );
      return res.json({ 
        isFavorite: false,
        message: '❌ Publicación eliminada de favoritos' 
      });
    } else {
      // Si no existe, insertar
      await pool.query(
        'INSERT INTO favoritos (usuario_id, publicacion_id) VALUES ($1, $2)',
        [usuario_id, publicacion_id]
      );
      return res.status(201).json({ 
        isFavorite: true,
        message: '💖 Publicación añadida a favoritos' 
      });
    }
  } catch (err) {
    console.error('❌ Error en toggleFavorite:', err);
    res.status(500).json({ error: 'Error al alternar favorito' });
  }
});

// Verificar si una publicación es favorita para el usuario actual
router.get('/favorite/:id', authMiddleware, async (req, res) => {
  try {
    const publicacion_id = req.params.id;
    const usuario_id = req.user.id;

    const check = await pool.query(
      'SELECT * FROM favoritos WHERE usuario_id = $1 AND publicacion_id = $2',
      [usuario_id, publicacion_id]
    );

    res.json({ isFavorite: check.rows.length > 0 });
  } catch (err) {
    console.error('❌ Error al verificar favorito:', err);
    res.status(500).json({ error: 'Error al verificar favorito' });
  }
});

// Obtener las publicaciones favoritas del usuario
router.get('/favorites', authMiddleware, async (req, res) => {
  try {
    const usuario_id = req.user.id;

    const result = await pool.query(
      `SELECT p.*, c.nombre as categoria 
       FROM publicaciones p 
       INNER JOIN favoritos f ON p.id = f.publicacion_id 
       LEFT JOIN categorias c ON p.categoria_id = c.id
       WHERE f.usuario_id = $1`,
      [usuario_id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error('❌ Error al obtener favoritos:', err);
    res.status(500).json({ error: 'Error al obtener favoritos' });
  }
});

// Obtener el detalle de una publicación por ID (público)
router.get('/:id', postController.getPostById);

// Eliminar una publicación (protegida)
router.delete('/:id', authMiddleware, postController.deletePost);

module.exports = router;