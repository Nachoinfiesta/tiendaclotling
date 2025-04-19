const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const authMiddleware = require('../middlewares/authMiddleware');

// Obtener todas las categorías (público)
router.get('/', categoryController.getAllCategories);

// Obtener una categoría específica (público)
router.get('/:id', categoryController.getCategoryById);

// Las siguientes rutas requieren autenticación (idealmente con rol de administrador)
router.post('/', authMiddleware, categoryController.createCategory);
router.put('/:id', authMiddleware, categoryController.updateCategory);
router.delete('/:id', authMiddleware, categoryController.deleteCategory);

module.exports = router;
