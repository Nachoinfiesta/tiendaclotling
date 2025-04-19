const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Crear directorio de uploads si no existe
const uploadDir = process.env.NODE_ENV === 'production'
  ? path.join('/tmp/uploads') // Para entornos como Render que usan /tmp
  : path.join(__dirname, '../public/uploads');

if (!fs.existsSync(uploadDir)) {
  try {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log(`Directorio de uploads creado en: ${uploadDir}`);
  } catch (error) {
    console.error(`Error al crear directorio de uploads: ${error.message}`);
  }
}

// Configurar almacenamiento
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Verificar si el directorio existe y se pueden escribir archivos
    fs.access(uploadDir, fs.constants.W_OK, (err) => {
      if (err) {
        return cb(new Error(`No se puede escribir en el directorio de uploads: ${err.message}`));
      }
      cb(null, uploadDir);
    });
  },
  filename: function (req, file, cb) {
    // Generar nombre único y seguro usando crypto
    const randomName = crypto.randomBytes(16).toString('hex');
    const sanitizedOriginalName = path.basename(file.originalname).replace(/[^a-zA-Z0-9.]/g, '_');
    const extension = path.extname(sanitizedOriginalName).toLowerCase();
    const newFilename = `${randomName}${extension}`;
    
    console.log(`Guardando archivo '${sanitizedOriginalName}' como: ${newFilename}`);
    cb(null, newFilename);
  }
});

// Filtrar archivos (solo imágenes)
const fileFilter = (req, file, cb) => {
  // Validación estricta de tipo MIME
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error('Formato de archivo no soportado. Por favor, usa JPG, PNG, GIF o WEBP.'), false);
  }
  
  // Validación adicional de extensión
  const extension = path.extname(file.originalname).toLowerCase();
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  
  if (!allowedExtensions.includes(extension)) {
    return cb(new Error('Extensión de archivo no permitida.'), false);
  }
  
  cb(null, true);
};

// Crear el middleware de carga
const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // Limite de 5MB
    files: 1 // Máximo 1 archivo por solicitud
  }
});

// Middleware para manejar errores de Multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Errores de Multer
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'El archivo excede el tamaño máximo de 5MB.' });
    }
    return res.status(400).json({ error: `Error en la carga: ${err.message}` });
  } else if (err) {
    // Otros errores
    return res.status(400).json({ error: err.message });
  }
  next();
};

module.exports = { upload, handleMulterError };
