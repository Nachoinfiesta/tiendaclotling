const fs = require('fs');
const path = require('path');
const pool = require('./db');

async function runMigrations() {
  console.log('Ejecutando migraciones de base de datos...');
  
  try {
    // Primero verificar la conexión a la base de datos
    try {
      await pool.query('SELECT 1');
      console.log('✅ Conexión a la base de datos establecida correctamente');
    } catch (connectionError) {
      console.error('❌ No se pudo conectar a la base de datos:', connectionError.message);
      console.log('\n📋 Verifica los siguientes puntos:');
      console.log('1. PostgreSQL está instalado y en ejecución');
      console.log('2. Las credenciales en el archivo .env son correctas');
      console.log('3. La base de datos especificada existe');
      console.log('\n🔍 Para crear la base de datos manualmente:');
      console.log('   psql -U postgres');
      console.log('   CREATE DATABASE marketplace;');
      console.log('   \\q');
      return;
    }
    
    // Verificar si ya existen las tablas
    const checkTable = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'usuarios'
      )
    `);
    
    if (checkTable.rows[0].exists) {
      console.log('✅ Las tablas ya existen, omitiendo migraciones iniciales.');
      
      // Opcionalmente ejecutar migraciones incrementales si existen
      const migrationPath = path.join(__dirname, 'migrations');
      if (fs.existsSync(migrationPath)) {
        console.log('🔄 Ejecutando migraciones incrementales...');
        // Aquí podría ir lógica para ejecutar migraciones adicionales
      }
      
      return;
    }
    
    // Leer archivo SQL de esquema
    const schemaPath = path.join(__dirname, 'schema.sql');
    if (!fs.existsSync(schemaPath)) {
      console.error(`❌ El archivo schema.sql no existe en la ruta: ${schemaPath}`);
      return;
    }

    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Ejecutar script de esquema
    await pool.query(schema);
    console.log('✅ Migraciones completadas exitosamente.');
    console.log('🎉 Base de datos inicializada correctamente!');
    
  } catch (error) {
    // Si el error es por tablas que ya existen, no es crítico
    if (error.code === '23505') {
      console.log('Las tablas ya existen, omitiendo migraciones.');
      return;
    }
    
    console.error('❌ Error en las migraciones:', error);
    // No hacemos process.exit(1) para que el servidor pueda iniciar de todos modos
  }
}

// Si se ejecuta directamente (no como módulo)
if (require.main === module) {
  runMigrations()
    .then(() => {
      console.log('Proceso de migración completado.');
      process.exit(0);
    })
    .catch(err => {
      console.error('Error fatal en el proceso de migración:', err);
      process.exit(1);
    });
} else {
  module.exports = runMigrations;
}
