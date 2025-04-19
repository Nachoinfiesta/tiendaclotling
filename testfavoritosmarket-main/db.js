const { Pool } = require('pg');
require('dotenv').config();

// Configuración para conexión a la base de datos
let pool;

// Verificar si estamos usando URL completa o parámetros individuales
if (process.env.DATABASE_URL) {
  // Usar conexión por URL (producción)
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });
  console.log('Configurando conexión por DATABASE_URL');
} else {
  // Usar parámetros individuales (desarrollo)
  pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'marketplace',
    password: process.env.DB_PASSWORD || 'postgres',
    port: process.env.DB_PORT || 5432
  });
  console.log('Configurando conexión por parámetros individuales');
}

// Comprobar conexión al iniciar
pool.on('connect', () => {
  console.log('Conexión a la base de datos establecida');
});

pool.on('error', (err) => {
  console.error('Error inesperado en el pool de PostgreSQL', err);
});

module.exports = pool;