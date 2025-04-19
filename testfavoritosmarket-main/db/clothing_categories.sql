-- Actualizar las categorías para un marketplace de moda

-- Primero eliminamos las categorías existentes
TRUNCATE TABLE categorias CASCADE;

-- Reiniciamos la secuencia de IDs
ALTER SEQUENCE categorias_id_seq RESTART WITH 1;

-- Insertamos nuevas categorías específicas de moda
INSERT INTO categorias (nombre, descripcion, imagen) 
VALUES 
    ('Camisetas', 'Camisetas para hombre y mujer, manga corta, manga larga', 'https://images.unsplash.com/photo-1576566588028-4147f3842f27'),
    ('Pantalones', 'Jeans, pantalones de vestir, shorts y leggins', 'https://images.unsplash.com/photo-1542272604-787c3835535d'),
    ('Vestidos', 'Vestidos casuales, formales y de fiesta', 'https://images.unsplash.com/photo-1595777457583-95e059d581b8'),
    ('Abrigos', 'Chaquetas, abrigos, blazers y cardigans', 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea'),
    ('Calzado', 'Zapatos, tenis, sandalias y botas', 'https://images.unsplash.com/photo-1549298916-b41d501d3772'),
    ('Accesorios', 'Bolsos, cinturones, bufandas y joyería', 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26'),
    ('Ropa Deportiva', 'Ropa para hacer ejercicio, yoga y deporte en general', 'https://images.unsplash.com/photo-1517466787929-bc90951d0974'),
    ('Ropa Interior', 'Ropa interior, pijamas y calcetines', 'https://images.unsplash.com/photo-1586643234822-e140e2ebeaf7'),
    ('Trajes de Baño', 'Bikinis, bañadores y accesorios de playa', 'https://images.unsplash.com/photo-1570037276380-c3a73c635173'),
    ('Ropa Infantil', 'Ropa para niños y bebés', 'https://images.unsplash.com/photo-1522771930-78848d9293e8');

-- Actualizamos cualquier publicación existente a categorías válidas
-- Las asignamos a "Camisetas" (ID 1) por defecto
UPDATE publicaciones SET categoria_id = 1 WHERE categoria_id IS NULL OR
    categoria_id NOT IN (SELECT id FROM categorias);

-- Añadir la restricción de foreign key si no existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_publicaciones_categoria'
    ) THEN
        ALTER TABLE publicaciones 
        ADD CONSTRAINT fk_publicaciones_categoria 
        FOREIGN KEY (categoria_id) REFERENCES categorias(id);
    END IF;
END $$;
