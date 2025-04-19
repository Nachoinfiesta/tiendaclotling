require('dotenv').config({ path: '../.env' });
const fs = require('fs');
const path = require('path');
const pool = require('../db');

// Leer el archivo SQL
const categoriesSQL = fs.readFileSync(path.join(__dirname, 'clothing_categories.sql'), 'utf8');

async function updateCategories() {
  try {
    console.log('Conectando a la base de datos...');
    
    // Ejecutar el script de categorías
    console.log('Actualizando categorías de moda...');
    await pool.query(categoriesSQL);
    console.log('✅ Categorías actualizadas correctamente');
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error al actualizar categorías:', err);
    process.exit(1);
  }
}

updateCategories();
