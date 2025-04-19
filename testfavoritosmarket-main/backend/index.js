require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const cookieParser = require('cookie-parser');
const { Pool } = require('pg'); // Usaremos pg directamente para PostgreSQL

// Inicializar Express
const app = express();

// ===================== CONFIGURACIÓN CRÍTICA PARA RENDER =====================
// Validar variables de entorno obligatorias
const requiredEnvVars = ['JWT_SECRET', 'DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
requiredEnvVars.forEach(env => {
  if (!process.env[env]) {
    console.error(`❌ Error: La variable ${env} no está configurada`);
    process.exit(1);
  }
});

// ===================== CONFIGURACIÓN DE LA BASE DE DATOS =====================
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
  ssl: {
    rejectUnauthorized: false // Necesario para conexiones SSL con ElephantSQL/Render
  }
});

// Verificar conexión a la base de datos
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Error al conectar a PostgreSQL:', err.stack);
  } else {
    console.log('✅ Conexión exitosa a PostgreSQL. Hora actual:', res.rows[0].now);
  }
});

// ===================== CONFIGURACIÓN DE MIDDLEWARES =====================
// CORS para producción
const allowedOrigins = [
  'https://tiendacl.netlify.app', // Tu frontend en Netlify
  process.env.FRONTEND_URL, // Variable de entorno como respaldo
  'http://localhost:3000' // Desarrollo local
].filter(Boolean); // Elimina valores undefined

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Acceso no permitido por CORS'));
    }
  },
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

// ===================== CONFIGURACIÓN DE ARCHIVOS ESTÁTICOS =====================
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log(`📂 Directorio 'uploads' creado en: ${uploadsDir}`);
}

app.use('/uploads', express.static(uploadsDir, {
  maxAge: '1d', // Cache de 1 día
  setHeaders: (res, path) => {
    if (path.endsWith('.jpg') || path.endsWith('.png')) {
      res.setHeader('Content-Type', 'image/jpeg');
    }
  }
}));

// ===================== RUTAS =====================
// Importar rutas
const favoriteRoutes = require('./routes/favoriteRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const profileRoutes = require('./routes/profileRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

// Montar rutas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/upload', uploadRoutes);

// ===================== MANEJO DE ERRORES =====================
// Ruta de prueba
app.get('/api/healthcheck', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    db: process.env.DB_HOST ? 'connected' : 'disconnected'
  });
});

// Ruta principal
app.get('/', (req, res) => {
  res.json({
    message: 'API de TiendaCL',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      products: '/api/posts',
      favorites: '/api/favorites'
    }
  });
});

// Manejo de errores 404
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Middleware de errores
app.use((err, req, res, next) => {
  console.error('🔥 Error:', err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// ===================== INICIAR SERVIDOR =====================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`
  🚀 Servidor iniciado en puerto ${PORT}
  🔗 URL local: http://localhost:${PORT}
  🌍 Entorno: ${process.env.NODE_ENV || 'development'}
  `);
});

// Exportar para pruebas
module.exports = app;