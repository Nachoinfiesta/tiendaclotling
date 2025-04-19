const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

module.exports = function(req, res, next) {
  try {
    // Obtener token de cookie (preferido) o del header de autorización
    let token = req.cookies?.token; // Primero intentamos desde cookie
    
    // Si no hay cookie, intentamos desde el header (para compatibilidad)
    if (!token) {
      const authHeader = req.header('Authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }
    
    if (!token) {
      return res.status(401).json({ error: 'Acceso denegado. No se proporcionó token de autenticación.' });
    }

    // Verificar token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Comprobación crítica: asegurarse de que el ID de usuario existe
      if (!decoded.id) {
        console.error('Token decodificado sin ID de usuario:', decoded);
        return res.status(401).json({ error: 'Token inválido: falta información del usuario' });
      }
      
      req.user = decoded;
      
      // Log para depuración
      console.log(`✅ Usuario autenticado: ${decoded.id}`);
      
      next();
    } catch (jwtError) {
      console.error('Error al verificar token JWT:', jwtError.message);
      
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'El token de autenticación ha expirado' });
      } else if (jwtError.name === 'JsonWebTokenError') {
        return res.status(401).json({ error: 'Token inválido' });
      }
      
      throw jwtError; // Re-lanzar otros errores
    }
  } catch (err) {
    console.error('Error general de autenticación:', err.message);
    res.status(401).json({ error: 'Error de autenticación: ' + err.message });
  }
};
