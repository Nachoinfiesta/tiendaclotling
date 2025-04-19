const jwt = require('jsonwebtoken');
const pool = require('../db');

module.exports = async (req, res, next) => {
  try {
    // Obtener token desde el header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Acceso denegado. No se proporcionó token.' });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tu_clave_secreta_aqui');
    
    // Encontrar usuario por ID
    const result = await pool.query('SELECT id, nombre, email FROM usuarios WHERE id = $1', [decoded.userId || decoded.id]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Token válido pero usuario no encontrado.' });
    }
    
    // Adjuntar datos del usuario al objeto de solicitud
    req.user = result.rows[0];
    
    next();
  } catch (error) {
    console.error('Error en middleware de autenticación:', error);
    res.status(401).json({ error: 'Token inválido o expirado' });
  }
};