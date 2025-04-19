const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favoriteController');
const auth = require('../middleware/authMiddleware');

// Middleware de depuración para verificar la cadena
const verifyAuthData = (req, res, next) => {
  console.log('📊 Route middleware - Verificando datos de autenticación');
  console.log('📊 req.user presente:', !!req.user);
  if (req.user) {
    console.log('📊 req.user.id:', req.user.id);
  }
  next();
};

// Aplicar cadena de middlewares en orden correcto
router.post('/', auth, verifyAuthData, favoriteController.toggleFavorite);
router.get('/', auth, verifyAuthData, favoriteController.getFavorites);
router.get('/check/:postId', auth, verifyAuthData, favoriteController.checkFavorite);

module.exports = router;
