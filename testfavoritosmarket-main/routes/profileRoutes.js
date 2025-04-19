const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');

// Log para depuración
router.use((req, res, next) => {
  console.log('📍 Profile Route:', req.method, req.path);
  next();
});

router.get('/', authMiddleware, userController.getProfile);
router.get('/stats', authMiddleware, userController.getUserStats);
router.put('/update', authMiddleware, userController.updateProfile);

// Ruta protegida para actualizar el perfil
router.put('/', authMiddleware, userController.updateProfile);

module.exports = router;
