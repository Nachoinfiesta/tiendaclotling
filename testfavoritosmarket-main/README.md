# FavoritosMarket

Plataforma de marketplace donde los usuarios pueden publicar productos, marcarlos como favoritos y gestionar su perfil.

## Tecnologías Utilizadas

- **Frontend**: React.js, React Bootstrap, Axios
- **Backend**: Node.js, Express
- **Base de Datos**: PostgreSQL
- **Autenticación**: JWT, Cookies HTTP-Only

## Estructura del Proyecto

```
testfavoritosmarket/
├── backend/             # Servidor API Express
├── frontend/            # Aplicación React
└── README.md            # Documentación del proyecto
```

## Requisitos Previos

- Node.js (v14.x o superior)
- npm (v6.x o superior)
- PostgreSQL (v12.x o superior)

## Configuración Inicial

### 1. Clonar el Repositorio

```bash
git clone https://github.com/tu-usuario/favoritosmarket.git
cd favoritosmarket
```

### 2. Configurar la Base de Datos

Tienes dos opciones:

#### Opción A: Configuración Automática

El proyecto incluye un script que creará la base de datos automáticamente si no existe:

```bash
# Asegúrate de configurar el archivo .env primero
cp backend/.env.example backend/.env
# Edita el archivo con tus credenciales de PostgreSQL
nano backend/.env

# Luego ejecuta:
cd backend
npm run setup-db
```

#### Opción B: Configuración Manual

Si prefieres crear la base de datos manualmente:

```bash
# Conecta a PostgreSQL
psql -U postgres

# Crea la base de datos
CREATE DATABASE marketplace;

# Sal de psql
\q

# Ejecuta las migraciones para crear las tablas
cd backend
npm run migrate
```

### 3. Instalar Dependencias

```bash
# Instalar dependencias del backend
cd backend
npm install

# Instalar dependencias del frontend
cd ../frontend
npm install
```

### 4. Inicializar la Base de Datos

```bash
# Desde el directorio backend
cd ../backend
node db-migrate.js
```

## Ejecución del Proyecto

### 1. Iniciar el Backend

```bash
# Desde el directorio backend
cd backend
npm run dev
```

### 2. Iniciar el Frontend

```bash
# Desde el directorio frontend
cd frontend
npm start
```

La aplicación estará disponible en `http://localhost:3000`

## Funcionalidades Principales

- **Registro e inicio de sesión** de usuarios
- **Publicación** y **edición** de productos
- Marcado de publicaciones como **favoritos**
- **Gestión de perfil** de usuario
- **Carrito de compras**

## Seguridad

La aplicación implementa:
- Tokens JWT almacenados en cookies HTTP-Only
- Protección contra ataques XSS
- Validación de datos en frontend y backend
- Encriptación de contraseñas con bcrypt

## Mantenimiento

### Estructura de la Base de Datos

El esquema de la base de datos incluye:

- `usuarios`: Almacena información de usuarios
- `publicaciones`: Almacena productos publicados
- `categorias`: Categorías de productos
- `favoritos`: Relación entre usuarios y publicaciones favoritas

Para actualizar el esquema, edita el archivo `schema.sql` y ejecuta `node db-migrate.js`.

## Problemas Comunes

### Error de Conexión a la Base de Datos

Si encuentras errores como `getaddrinfo ENOTFOUND host`:

1. Verifica que PostgreSQL esté en ejecución
2. Comprueba que las credenciales en `.env` sean correctas
3. Asegúrate de que la base de datos exista

### Problemas de Autenticación

Si experimentas problemas con el login o sesiones:

1. Limpia el localStorage del navegador
2. Verifica que el archivo `.env` tenga un `JWT_SECRET` configurado
3. Reinicia tanto el servidor frontend como backend

## Licencia

[MIT License](LICENSE)
