-- Inicializa la base de datos del marketplace

-- Crear la base de datos si no existe
CREATE DATABASE IF NOT EXISTS marketplace;

-- Conectar a la base de datos
\c marketplace;

-- Crear tablas con soporte adecuado para caracteres especiales
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL,
    foto_perfil TEXT,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS publicaciones (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(100) NOT NULL,
    descripcion TEXT NOT NULL,
    categoria VARCHAR(50) NOT NULL,
    precio NUMERIC(10, 2) NOT NULL,
    imagen TEXT NOT NULL,
    usuario_id INTEGER REFERENCES usuarios(id),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado VARCHAR(20) DEFAULT 'activo'
);

CREATE TABLE IF NOT EXISTS favoritos (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id),
    publicacion_id INTEGER REFERENCES publicaciones(id),
    fecha_favorito TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(usuario_id, publicacion_id)
);

-- Asegurar que la codificación de la base de datos es UTF-8
ALTER DATABASE marketplace SET client_encoding TO 'UTF8';

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_publicaciones_usuario ON publicaciones(usuario_id);
CREATE INDEX IF NOT EXISTS idx_favoritos_usuario ON favoritos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_favoritos_publicacion ON favoritos(publicacion_id);
CREATE INDEX IF NOT EXISTS idx_publicaciones_titulo ON publicaciones(titulo);
CREATE INDEX IF NOT EXISTS idx_publicaciones_categoria ON publicaciones(categoria);

-- Comentarios de las tablas
COMMENT ON TABLE usuarios IS 'Almacena información de los usuarios registrados';
COMMENT ON TABLE publicaciones IS 'Almacena las publicaciones de productos para vender';
COMMENT ON TABLE favoritos IS 'Almacena las publicaciones marcadas como favoritas por los usuarios';

-- Insertar datos de ejemplo (opcional)
INSERT INTO usuarios (nombre, email, password, foto_perfil)
VALUES 
('Usuario Demo', 'demo@example.com', '$2a$10$1JK2CKrzGdlgRuDUFhqvXOXEw.y1xZ5vVRgHMMd/QeACeKvYwB28i', 'https://randomuser.me/api/portraits/men/1.jpg'),
('María López', 'maria@example.com', '$2a$10$1JK2CKrzGdlgRuDUFhqvXOXEw.y1xZ5vVRgHMMd/QeACeKvYwB28i', 'https://randomuser.me/api/portraits/women/2.jpg');

-- La contraseña encriptada corresponde a 'password123'
