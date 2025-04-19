const bcrypt = require('bcryptjs');
const pool = require('./db'); // Asegúrate de que la conexión a la base de datos esté configurada

(async () => {
  try {
    // Obtén todos los usuarios
    const users = await pool.query('SELECT id, password FROM usuarios');

    for (const user of users.rows) {
      // Verifica si la contraseña ya está encriptada
      if (!user.password.startsWith('$2a$')) {
        // Encripta la contraseña
        const hashedPassword = await bcrypt.hash(user.password, 10);

        // Actualiza la contraseña en la base de datos
        await pool.query('UPDATE usuarios SET password = $1 WHERE id = $2', [hashedPassword, user.id]);
        console.log(`Contraseña actualizada para el usuario con ID: ${user.id}`);
      }
    }

    console.log('Todas las contraseñas han sido actualizadas.');
    process.exit();
  } catch (err) {
    console.error('Error al actualizar contraseñas:', err.message);
    process.exit(1);
  }
})();