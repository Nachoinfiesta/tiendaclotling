const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const auth = require('../middleware/authMiddleware');

// Crear el directorio de uploads si no existe
const uploadDir = process.env.NODE_ENV === 'production'
  ? path.join('/tmp/uploads') // Usar /tmp en producción (Render)
  : path.join(__dirname, '../uploads');

if (!fs.existsSync(uploadDir)) {
  console.log('Creando directorio de uploads:', uploadDir);
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuración de almacenamiento
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueFileName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueFileName);
  }
});

// Configuración de multer
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB límite
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Solo se permiten imágenes (jpeg, jpg, png, gif, webp)'));
  }
});

// Ruta para subir imágenes que requiere autenticación
router.post('/image', auth, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se ha subido ningún archivo' });
    }
    
    // Construir la URL del archivo usando path.basename para obtener solo el nombre del archivo
    const fileName = path.basename(req.file.path);
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${fileName}`;
    
    console.log('Archivo subido:', {
      originalName: req.file.originalname,
      savedAs: req.file.filename,
      path: req.file.path,
      url: fileUrl
    });
    
    res.json({
      success: true,
      fileUrl
    });
  } catch (error) {
    console.error('Error al subir la imagen:', error);
    res.status(500).json({ error: 'Error al subir la imagen' });
  }
});

// Ruta para subir imágenes durante el registro (sin autenticación)
router.post('/registration-image', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se ha subido ningún archivo' });
    }
    
    // Construir la URL del archivo usando path.basename para obtener solo el nombre del archivo
    const fileName = path.basename(req.file.path);
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${fileName}`;
    
    console.log('Archivo subido (registro):', {
      originalName: req.file.originalname,
      savedAs: req.file.filename,
      path: req.file.path,
      url: fileUrl
    });
    
    res.json({
      success: true,
      fileUrl
    });
  } catch (error) {
    console.error('Error al subir la imagen de registro:', error);
    res.status(500).json({ error: 'Error al subir la imagen' });
  }
});

module.exports = router;
