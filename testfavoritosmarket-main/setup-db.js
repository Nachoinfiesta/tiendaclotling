require('dotenv').config();
const { Client } = require('pg');
const runMigrations = require('./db-migrate');

/**
 * Script para crear la base de datos si no existe y ejecutar las migraciones
 */
async function setupDatabase() {
  // Conectar al servidor PostgreSQL (no a una base de datos específica)
  const client = new Client({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    password: process.env.DB_PASSWORD || 'postgres',
    port: process.env.DB_PORT || 5432,
    database: 'postgres' // Base de datos por defecto para administración
  });

  try {
    await client.connect();
    console.log('✅ Conectado al servidor PostgreSQL');

    // Verificar si la base de datos del marketplace existe
    const dbName = process.env.DB_NAME || 'marketplace';
    const checkResult = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [dbName]
    );
    
    // Si la base de datos no existe, crearla
    if (checkResult.rowCount === 0) {
      console.log(`🔧 La base de datos '${dbName}' no existe. Creándola...`);
      
      // Crear la base de datos (usando comillas dobles para nombres de tablas y bases de datos)
      await client.query(`CREATE DATABASE "${dbName}"`);
      console.log(`✅ Base de datos '${dbName}' creada exitosamente`);
    } else {
      console.log(`ℹ️ La base de datos '${dbName}' ya existe`);
    }

    // Cerrar la conexión inicial
    await client.end();
    console.log('Conexión cerrada después de verificación');

    // Ejecutar las migraciones para crear las tablas
    console.log('🔄 Ejecutando migraciones para crear las tablas...');
    await runMigrations();
    console.log('✅ Proceso de configuración de base de datos completado');

  } catch (error) {
    console.error('❌ Error durante la configuración de la base de datos:', error);
    process.exit(1);
  }
}

// Ejecutar la función si este script se llama directamente
if (require.main === module) {
  setupDatabase()
    .then(() => {
      console.log('🎉 Configuración completada con éxito');
      process.exit(0);
    })
    .catch(err => {
      console.error('Error fatal:', err);
      process.exit(1);
    });
}

module.exports = setupDatabase;
