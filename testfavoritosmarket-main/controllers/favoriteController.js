const pool = require('../db');

// Togglear estado de favorito
exports.toggleFavorite = async (req, res) => {
  console.log('⭐ toggleFavorite - Iniciando procesamiento');
  
  try {
    // CRÍTICO: Verificar explícitamente que req.user está disponible
    if (!req.user) {
      console.error('⭐ toggleFavorite - req.user no está definido');
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }
    
    // Obtener datos para la operación con conversión de tipo segura
    const usuario_id = parseInt(req.user.id, 10); // Conversión segura a entero
    const publicacion_id = parseInt(req.body.publicacion_id, 10);
    
    console.log('⭐ toggleFavorite - Datos:', { 
      usuario_id, 
      publicacion_id,
      user_object: JSON.stringify(req.user)
    });
    
    // Validación de datos completa
    if (isNaN(usuario_id)) {
      return res.status(400).json({ error: 'ID de usuario inválido' });
    }
    
    if (!publicacion_id || isNaN(publicacion_id)) {
      return res.status(400).json({ error: 'ID de publicación requerido y debe ser un número' });
    }
    
    // Interacción atómica con la base de datos en un bloque try-catch específico
    try {
      // Verificar si ya existe
      const checkResult = await pool.query(
        'SELECT id FROM favoritos WHERE usuario_id = $1 AND publicacion_id = $2',
        [usuario_id, publicacion_id]
      );
      
      // Estrategia "upsert"
      if (checkResult.rows.length > 0) {
        // Ya existe, eliminar
        const deleteResult = await pool.query(
          'DELETE FROM favoritos WHERE usuario_id = $1 AND publicacion_id = $2 RETURNING id',
          [usuario_id, publicacion_id]
        );
        
        console.log(`⭐ toggleFavorite - Favorito eliminado ID: ${deleteResult.rows[0]?.id}`);
        
        return res.json({
          message: 'Favorito eliminado correctamente',
          added: false
        });
      } else {
        // No existe, insertar
        // CRÍTICO: Asegurar tipos de datos correctos
        const result = await pool.query(
          'INSERT INTO favoritos (usuario_id, publicacion_id) VALUES ($1, $2) RETURNING id',
          [usuario_id, publicacion_id]
        );
        
        console.log(`⭐ toggleFavorite - Favorito añadido ID: ${result.rows[0].id}`);
        
        return res.status(201).json({
          message: 'Favorito añadido correctamente',
          added: true
        });
      }
    } catch (dbError) {
      // Manejar específicamente errores de DB
      console.error('⭐ toggleFavorite - Error de DB:', dbError);
      
      if (dbError.code === '23502') { // Violación de NOT NULL
        return res.status(400).json({
          error: 'Datos incompletos para favorito',
          detail: dbError.detail,
          errorCode: dbError.code
        });
      }
      
      throw dbError; // Re-lanzar para el manejador general
    }
  } catch (err) {
    console.error('⭐ toggleFavorite - Error general:', err);
    res.status(500).json({
      error: 'Error al procesar favorito',
      message: err.message
    });
  }
};

// Verificar si una publicación está en favoritos del usuario
exports.checkFavorite = async (req, res) => {
  try {
    // Obtener usuario_id desde el middleware de autenticación
    const usuario_id = req.user.id;
    const { postId } = req.params;

    console.log(`💫 checkFavorite - Verificando favorito: usuario=${usuario_id}, post=${postId}`);

    // Si no hay usuario autenticado, devolver false
    if (!usuario_id) {
      console.log(`💫 checkFavorite - Sin usuario autenticado`);
      return res.json({ isFavorite: false });
    }

    const result = await pool.query(
      'SELECT 1 FROM favoritos WHERE usuario_id = $1 AND publicacion_id = $2',
      [usuario_id, postId]
    );

    const isFavorite = result.rows.length > 0;
    console.log(`💫 checkFavorite - Resultado: ${isFavorite ? 'Es favorito' : 'No es favorito'}`);

    res.json({
      isFavorite: isFavorite
    });
  } catch (err) {
    console.error('❌ Error en checkFavorite:', err);
    res.status(500).json({
      error: 'Error al verificar favorito'
    });
  }
};

// Obtener favoritos del usuario
exports.getFavorites = async (req, res) => {
  try {
    const usuario_id = req.user.id;

    const result = await pool.query(
      `SELECT f.id, f.usuario_id, f.publicacion_id,
              p.titulo, p.descripcion, p.precio, p.imagen,
              c.nombre as categoria
       FROM favoritos f
       JOIN publicaciones p ON f.publicacion_id = p.id
       LEFT JOIN categorias c ON p.categoria_id = c.id
       WHERE f.usuario_id = $1`,
      [usuario_id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error('❌ Error en getFavorites:', err);
    res.status(500).json({
      error: 'Error al obtener favoritos'
    });
  }
};
