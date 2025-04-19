require('dotenv').config({ path: '../.env' });
const fs = require('fs');
const path = require('path');
const pool = require('../db');

// Leer el archivo SQL
const categoriesSQL = fs.readFileSync(path.join(__dirname, 'categories.sql'), 'utf8');

async function createTables() {
  try {
    console.log('Conectando a la base de datos...');
    
    // Ejecutar el script de categorías
    console.log('Ejecutando script de categorías...');
    await pool.query(categoriesSQL);
    console.log('✅ Script de categorías ejecutado correctamente');
    
    console.log('Todas las tablas han sido creadas correctamente');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error al crear tablas:', err);
    process.exit(1);
  }
}

createTables();
