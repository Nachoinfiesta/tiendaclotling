const pool = require('../db');

// Crear una nueva publicación
exports.createPost = async (req, res) => {
  try {
    // Verificar que tenemos un usuario autenticado
    if (!req.user || !req.user.id) {
      console.error('❌ createPost - No hay usuario autenticado');
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    const { titulo, descripcion, precio, categoria_id } = req.body;
    let imagen = req.file ? `/uploads/${req.file.filename}` : null;

    // Log para depuración
    console.log('📝 createPost - Datos recibidos:', {
      titulo, descripcion, precio, categoria_id, 
      imagen: imagen ? '[IMAGEN]' : 'null',
      usuario_id: req.user.id // Confirmamos que tenemos ID de usuario
    });

    // Validación de campos básica
    if (!titulo || !descripcion || !precio || !categoria_id) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    // IMPORTANTE: Asegurarnos de que usuario_id se incluya explícitamente
    const result = await pool.query(
      `INSERT INTO publicaciones (titulo, descripcion, precio, imagen, categoria_id, usuario_id) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [titulo, descripcion, precio, imagen, categoria_id, req.user.id]
    );

    console.log(`✅ createPost - Publicación creada ID: ${result.rows[0].id}, Usuario: ${result.rows[0].usuario_id}`);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('❌ Error al crear publicación:', err);
    res.status(500).json({ error: 'Error al crear la publicación' });
  }
};

// Obtener todas las publicaciones
exports.getAllPosts = async (req, res) => {
  try {
    console.log('📤 Intentando obtener publicaciones...');

    // Consulta modificada para incluir el JOIN con categorías
    const result = await pool.query(`
      SELECT p.*, c.nombre as categoria 
      FROM publicaciones p
      LEFT JOIN categorias c ON p.categoria_id = c.id
    `);

    console.log('✅ Publicaciones obtenidas:', result.rows.length, 'registro(s)');
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error en getAllPosts:', {
      message: error.message,
      stack: error.stack
    });

    res.status(500).json({ error: 'Error interno al obtener publicaciones' });
  }
};

// Obtener el detalle de una publicación por ID
exports.getPostById = async (req, res) => {
  try {
    const { id } = req.params;

    console.log('ID recibido en la solicitud:', id);

    // Verificar que el ID sea un número válido
    if (isNaN(id)) {
      return res.status(400).json({ error: 'El ID de la publicación debe ser un número válido.' });
    }

    // Consulta con JOIN para obtener la categoría
    const post = await pool.query(
      `SELECT p.*, c.nombre as categoria 
      FROM publicaciones p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      WHERE p.id = $1`,
      [id]
    );

    console.log('Resultado de la consulta SQL:', post.rows);

    if (post.rows.length === 0) {
      return res.status(404).json({ error: 'Publicación no encontrada.' });
    }

    // Asegurar que la categoría no es nula
    const postData = {
      ...post.rows[0],
      categoria: post.rows[0].categoria || 'Sin categoría'
    };

    // Log adicional para depuración
    console.log('Datos que se enviarán al frontend:', JSON.stringify(postData, null, 2));
    
    // Establecer headers específicos
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.json(postData);
  } catch (err) {
    console.error('Error al obtener el detalle de la publicación:', err);
    res.status(500).json({ error: 'Error al obtener el detalle de la publicación.' });
  }
};

// Obtener publicaciones del usuario autenticado
exports.getUserPosts = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Usuario no autenticado.' });
    }

    // Consulta modificada para obtener el nombre de la categoría mediante JOIN
    const posts = await pool.query(
      `SELECT p.*, c.nombre as categoria 
       FROM publicaciones p
       LEFT JOIN categorias c ON p.categoria_id = c.id
       WHERE p.usuario_id = $1`,
      [req.user.id]
    );

    console.log('Datos recuperados de BD con categorías:', posts.rows);
    res.json(posts.rows);
  } catch (err) {
    console.error('Error al obtener las publicaciones del usuario:', err);
    res.status(500).json({ error: 'Error al obtener las publicaciones del usuario.' });
  }
};

// Asegurarnos que deletePost está exportado correctamente
exports.deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verificar que el post exista y pertenezca al usuario
    const post = await pool.query(
      'SELECT * FROM publicaciones WHERE id = $1 AND usuario_id = $2',
      [id, userId]
    );

    if (post.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Publicación no encontrada o no tienes permiso para eliminarla' 
      });
    }

    // Eliminar el post
    await pool.query('DELETE FROM publicaciones WHERE id = $1', [id]);
    
    res.json({ message: 'Publicación eliminada exitosamente' });
  } catch (err) {
    console.error('Error al eliminar la publicación:', err);
    res.status(500).json({ error: 'Error al eliminar la publicación' });
  }
};

// Buscar publicaciones
exports.searchPosts = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: 'Se requiere un término de búsqueda' });
    }

    console.log('🔍 Buscando publicaciones con:', q);

    // Búsqueda modificada para usar JOIN con categorías
    const searchTerm = `%${q}%`;
    const result = await pool.query(
      `SELECT p.*, c.nombre as categoria 
       FROM publicaciones p
       LEFT JOIN categorias c ON p.categoria_id = c.id
       WHERE p.titulo ILIKE $1 
       OR p.descripcion ILIKE $1 
       OR c.nombre ILIKE $1`,
      [searchTerm]
    );

    console.log(`✅ Encontradas ${result.rows.length} publicaciones`);
    res.json(result.rows);
  } catch (err) {
    console.error('❌ Error en searchPosts:', err);
    res.status(500).json({ error: 'Error al buscar publicaciones' });
  }
};

// Actualizar una publicación
exports.updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descripcion, categoria_id, precio, imagen } = req.body;
    const usuario_id = req.user.id;

    console.log(`⌛ Actualizando publicación ${id} para usuario ${usuario_id}`);
    console.log('Datos recibidos:', req.body);

    // Verificar que todos los campos necesarios estén presentes
    if (!titulo || !descripcion || !categoria_id || !precio || !imagen) {
      console.log('Validación fallida:', { titulo, descripcion, categoria_id, precio, imagen });
      return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
    }

    // Verificar que la publicación existe
    const checkPost = await pool.query(
      'SELECT * FROM publicaciones WHERE id = $1', 
      [id]
    );

    if (checkPost.rows.length === 0) {
      return res.status(404).json({ error: 'Publicación no encontrada.' });
    }

    // Convertir IDs a números para comparación
    const postUsuarioId = parseInt(checkPost.rows[0].usuario_id);
    const currentUserId = parseInt(usuario_id);

    console.log(`🔍 Comparando IDs: publicación.usuario_id=${postUsuarioId}, usuario actual=${currentUserId}`);
    
    // Verificar que el usuario sea el propietario de la publicación
    if (postUsuarioId !== currentUserId) {
      return res.status(403).json({ error: 'No tienes permiso para editar esta publicación.' });
    }

    // Actualizar la publicación
    const updatedPost = await pool.query(
      `UPDATE publicaciones 
       SET titulo = $1, descripcion = $2, categoria_id = $3, precio = $4, imagen = $5 
       WHERE id = $6 
       RETURNING *`,
      [titulo, descripcion, categoria_id, precio, imagen, id]
    );

    console.log('✅ Publicación actualizada correctamente:', updatedPost.rows[0]);
    res.json(updatedPost.rows[0]);
  } catch (err) {
    console.error('❌ Error al actualizar la publicación:', err.message);
    res.status(500).json({ error: 'Error al actualizar la publicación.' });
  }
};