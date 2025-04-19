-- Verificar y actualizar la tabla de usuarios

-- Comprobar si existe la columna foto_perfil
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name='usuarios' AND column_name='foto_perfil'
    ) THEN
        ALTER TABLE usuarios ADD COLUMN foto_perfil TEXT;
    END IF;
END $$;

-- Comprobar si existe la columna nombre
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name='usuarios' AND column_name='nombre'
    ) THEN
        ALTER TABLE usuarios ADD COLUMN nombre VARCHAR(100) NOT NULL DEFAULT 'Usuario';
    END IF;
END $$;

-- Comprobar si existe la columna fecha_registro
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name='usuarios' AND column_name='fecha_registro'
    ) THEN
        ALTER TABLE usuarios ADD COLUMN fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    END IF;
END $$;
