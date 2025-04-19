-- Crear tabla de categorías si no existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'categorias'
    ) THEN
        CREATE TABLE categorias (
            id SERIAL PRIMARY KEY,
            nombre VARCHAR(50) NOT NULL UNIQUE,
            descripcion TEXT,
            imagen TEXT,
            fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        -- Insertar categorías iniciales de ejemplo
        INSERT INTO categorias (nombre, descripcion, imagen) 
        VALUES 
            ('Electronics', 'Productos electrónicos, gadgets y accesorios tecnológicos', 'https://images.unsplash.com/photo-1498049794561-7780e7231661'),
            ('Clothing', 'Ropa, calzado y accesorios de moda', 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f'),
            ('Home', 'Artículos para el hogar, muebles y decoración', 'https://images.unsplash.com/photo-1484101403633-562f891dc89a'),
            ('Sports', 'Equipo deportivo, ropa deportiva y accesorios', 'https://images.unsplash.com/photo-1517649763962-0c623066013b'),
            ('Books', 'Libros, revistas y material de lectura', 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d'),
            ('Toys', 'Juguetes y juegos para todas las edades', 'https://images.unsplash.com/photo-1516981879613-9f5da904015f'),
            ('Vehicles', 'Automóviles, motocicletas y accesorios', 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf'),
            ('Services', 'Servicios profesionales y personales', 'https://images.unsplash.com/photo-1521791136064-7986c2920216');
    END IF;

    -- Verificar si existe la columna categoria_id en publicaciones
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'publicaciones' AND column_name = 'categoria_id'
    ) THEN
        -- Añadir columna categoria_id a la tabla publicaciones
        ALTER TABLE publicaciones ADD COLUMN categoria_id INTEGER;
        
        -- Crear la tabla de categorías si no existe
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'categorias') THEN
            -- Actualizar publicaciones existentes con una categoría por defecto (Home = 3)
            UPDATE publicaciones SET categoria_id = 3 WHERE categoria_id IS NULL;
            
            -- Añadir la restricción de foreign key
            ALTER TABLE publicaciones 
            ADD CONSTRAINT fk_publicaciones_categoria 
            FOREIGN KEY (categoria_id) REFERENCES categorias(id);
        END IF;
    END IF;
END $$;
