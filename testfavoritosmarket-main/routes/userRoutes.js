const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/register', userController.register);
router.post('/login', userController.login);

// Rutas protegidas
router.get('/profile', authMiddleware, userController.getProfile);
router.post('/create-post', authMiddleware, userController.createPost);
router.get('/my-posts', authMiddleware, userController.getMyPosts);
// Obtener los datos de un usuario por ID
router.get('/:id', userController.getUserById);
module.exports = router;
