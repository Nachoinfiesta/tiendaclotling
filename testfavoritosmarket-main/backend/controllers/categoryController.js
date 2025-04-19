const pool = require('../db');

// Obtener todas las categorías
exports.getAllCategories = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categorias ORDER BY nombre');
    console.log(`Se encontraron ${result.rows.length} categorías`);
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener categorías:', err);
    res.status(500).json({ error: 'Error al obtener las categorías' });
  }
};

// Obtener una categoría específica por ID
exports.getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM categorias WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error al obtener la categoría:', err);
    res.status(500).json({ error: 'Error al obtener la categoría' });
  }
};

// Crear una nueva categoría (solo para administradores)
exports.createCategory = async (req, res) => {
  try {
    const { nombre, descripcion, imagen } = req.body;
    
    if (!nombre) {
      return res.status(400).json({ error: 'El nombre de la categoría es obligatorio' });
    }
    
    const result = await pool.query(
      'INSERT INTO categorias (nombre, descripcion, imagen) VALUES ($1, $2, $3) RETURNING *',
      [nombre, descripcion || '', imagen || '']
    );
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error al crear categoría:', err);
    if (err.code === '23505') { // Unique violation
      return res.status(400).json({ error: 'Ya existe una categoría con ese nombre' });
    }
    res.status(500).json({ error: 'Error al crear la categoría' });
  }
};

// Actualizar una categoría existente (solo para administradores)
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, imagen } = req.body;
    
    if (!nombre) {
      return res.status(400).json({ error: 'El nombre de la categoría es obligatorio' });
    }
    
    const result = await pool.query(
      'UPDATE categorias SET nombre = $1, descripcion = $2, imagen = $3 WHERE id = $4 RETURNING *',
      [nombre, descripcion || '', imagen || '', id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error al actualizar categoría:', err);
    if (err.code === '23505') { // Unique violation
      return res.status(400).json({ error: 'Ya existe una categoría con ese nombre' });
    }
    res.status(500).json({ error: 'Error al actualizar la categoría' });
  }
};

// Eliminar una categoría (solo para administradores)
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar si hay publicaciones usando esta categoría
    const checkPosts = await pool.query(
      'SELECT COUNT(*) FROM publicaciones WHERE categoria_id = $1',
      [id]
    );
    
    if (parseInt(checkPosts.rows[0].count) > 0) {
      return res.status(400).json({ 
        error: 'No se puede eliminar la categoría porque hay publicaciones asociadas a ella' 
      });
    }
    
    const result = await pool.query('DELETE FROM categorias WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }
    
    res.json({ message: 'Categoría eliminada correctamente' });
  } catch (err) {
    console.error('Error al eliminar categoría:', err);
    res.status(500).json({ error: 'Error al eliminar la categoría' });
  }
};
