const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');

// Constantes de configuración
const TOKEN_EXPIRY = '7d'; // 7 días
const COOKIE_OPTIONS = {
  httpOnly: true,           // No accesible desde JavaScript
  secure: process.env.NODE_ENV === 'production', // HTTPS en producción
  sameSite: 'strict',       // Protección CSRF
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días en milisegundos
};

/**
 * Controlador para registro de usuarios
 */
exports.register = async (req, res) => {
  try {
    const { nombre, email, password, foto_perfil } = req.body;
    
    // Validación básica
    if (!nombre || !email || !password) {
      return res.status(400).json({ error: 'Por favor complete todos los campos requeridos' });
    }
    
    // Verificar si el correo ya está registrado
    const userExists = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: 'Este correo electrónico ya está registrado' });
    }
    
    // Encriptar contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Insertar nuevo usuario
    const newUser = await pool.query(
      'INSERT INTO usuarios (nombre, email, password, foto_perfil) VALUES ($1, $2, $3, $4) RETURNING id, nombre, email, foto_perfil',
      [nombre, email, hashedPassword, foto_perfil || null]
    );
    
    // Crear token JWT
    const payload = {
      id: newUser.rows[0].id,
      nombre: newUser.rows[0].nombre,
      email: newUser.rows[0].email
    };
    
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
    
    // Establecer cookie HTTP-Only
    res.cookie('token', token, COOKIE_OPTIONS);
    
    // Enviar respuesta con datos de usuario y token
    res.status(201).json({
      user: {
        id: newUser.rows[0].id,
        nombre: newUser.rows[0].nombre,
        email: newUser.rows[0].email,
        foto_perfil: newUser.rows[0].foto_perfil
      },
      token // También devolvemos el token para compatibilidad
    });
  } catch (err) {
    console.error('Error en registro:', err);
    res.status(500).json({ error: 'Error en el servidor al registrar usuario' });
  }
};

/**
 * Controlador para login de usuarios
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validar campos requeridos
    if (!email || !password) {
      return res.status(400).json({ error: 'Por favor proporcione email y contraseña' });
    }
    
    // Buscar usuario
    const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    
    // Verificar si el usuario existe
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    
    const user = result.rows[0];
    
    // Verificar contraseña con bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    
    // Crear token JWT asegurando que incluye el ID
    const payload = {
      id: user.id,
      nombre: user.nombre,
      email: user.email
    };
    
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
    
    // Establecer cookie HTTP-Only
    res.cookie('token', token, COOKIE_OPTIONS);
    
    // Devolver información del usuario y token
    res.json({
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        foto_perfil: user.foto_perfil
      },
      token // También devolvemos el token para compatibilidad
    });
  } catch (err) {
    console.error('Error en login:', err);
    res.status(500).json({ error: 'Error en el servidor al iniciar sesión' });
  }
};

/**
 * Controlador para cerrar sesión
 */
exports.logout = (req, res) => {
  // Eliminar la cookie
  res.clearCookie('token');
  res.json({ message: 'Sesión cerrada exitosamente' });
};

/**
 * Controlador para obtener perfil de usuario
 */
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Obtener datos del usuario desde la base de datos
    const result = await pool.query(
      'SELECT id, nombre, email, foto_perfil, fecha_registro FROM usuarios WHERE id = $1',
      [userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error al obtener perfil:', err);
    res.status(500).json({ error: 'Error en el servidor al obtener perfil' });
  }
};

/**
 * Controlador para actualizar perfil de usuario
 */
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { nombre, foto_perfil } = req.body;
    
    // Actualizar datos del usuario
    const result = await pool.query(
      'UPDATE usuarios SET nombre = COALESCE($1, nombre), foto_perfil = COALESCE($2, foto_perfil) WHERE id = $3 RETURNING id, nombre, email, foto_perfil',
      [nombre, foto_perfil, userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error al actualizar perfil:', err);
    res.status(500).json({ error: 'Error en el servidor al actualizar perfil' });
  }
};