const pool = require('../db');

// 🔁 Alternar una publicación en favoritos (agregar o eliminar)
exports.toggleFavorite = async (req, res) => {
  try {
    const { publicacion_id } = req.body;
    const usuario_id = req.user.id;

    console.log('📩 toggleFavorite recibido:', { usuario_id, publicacion_id });

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
      return res.json({ message: '❌ Publicación eliminada de favoritos' });
    } else {
      // Si no existe, insertar
      await pool.query(
        'INSERT INTO favoritos (usuario_id, publicacion_id) VALUES ($1, $2)',
        [usuario_id, publicacion_id]
      );
      return res.status(201).json({ message: '💖 Publicación añadida a favoritos' });
    }
  } catch (err) {
    console.error('❌ Error en toggleFavorite:', {
      message: err.message,
      detail: err.detail,
      code: err.code,
    });
    res.status(500).json({ error: 'Error al alternar favorito' });
  }
};

// 📥 Obtener las publicaciones favoritas del usuario
exports.getFavorites = async (req, res) => {
  try {
    const usuario_id = req.user.id;

    const result = await pool.query(
      'SELECT p.* FROM publicaciones p INNER JOIN favoritos f ON p.id = f.publicacion_id WHERE f.usuario_id = $1',
      [usuario_id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error('❌ Error al obtener favoritos:', err);
    res.status(500).json({ error: 'Error al obtener favoritos' });
  }
};

// ✅ Verificar si una publicación es favorita del usuario
exports.checkFavorite = async (req, res) => {
  try {
    const publicacion_id = req.params.id;
    const usuario_id = req.user.id;

    if (!publicacion_id) {
      return res.status(400).json({ error: 'El ID de la publicación es obligatorio.' });
    }

    // Verificar si está en favoritos
    const check = await pool.query(
      'SELECT * FROM favoritos WHERE usuario_id = $1 AND publicacion_id = $2',
      [usuario_id, publicacion_id]
    );

    res.json({ isFavorite: check.rows.length > 0 });
  } catch (err) {
    console.error('❌ Error en checkFavorite:', err);
    res.status(500).json({ error: 'Error al verificar favorito' });
  }
};
