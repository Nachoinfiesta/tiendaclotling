# Guía de Instalación Paso a Paso

## 1. Clonar el Repositorio
```bash
git clone [URL-del-repositorio]
cd testfavoritosmarket
```

## 2. Configurar PostgreSQL
1. Asegúrate de tener PostgreSQL instalado
2. Abre pgAdmin o terminal PostgreSQL
3. Inicia sesión con tu usuario postgres
4. Ejecuta:
```bash
psql -U postgres -f backend/db/init.sql
```

## 3. Configurar Variables de Entorno

### Backend (.env)
1. Ve a la carpeta backend
2. Crea un archivo llamado `.env`
3. Copia este contenido:
```properties
JWT_SECRET=puedes_poner_cualquier_texto_secreto_aqui_123
DB_HOST=localhost
DB_PORT=5432
DB_NAME=marketplace
DB_USER=postgres
DB_PASSWORD=tu_contraseña_de_postgres
```
⚠️ Reemplaza "tu_contraseña_de_postgres" con tu contraseña real de PostgreSQL

### Frontend (.env)
1. Ve a la carpeta frontend
2. Crea un archivo llamado `.env`
3. Copia este contenido:
```properties
REACT_APP_API_URL=http://localhost:5000/api
```

## 4. Instalar Dependencias
```bash
# Instalar dependencias globales
npm install

# Instalar dependencias del backend
cd backend
npm install

# Instalar dependencias del frontend
cd ../frontend
npm install
```

## 5. Iniciar la Aplicación

### Iniciar Backend
```bash
cd backend
npm run dev
```

### Iniciar Frontend (en otra terminal)
```bash
cd frontend
npm start
```

## Verificación
Abre tu navegador y visita:
- http://localhost:3000

## Solución de Problemas Comunes

### Error de PostgreSQL
Si ves errores de conexión a la base de datos:
1. Verifica que PostgreSQL esté ejecutándose
2. Confirma que la contraseña en el archivo .env sea correcta
3. Asegúrate que el puerto 5432 esté disponible

### Error de Puertos
- Si el puerto 3000 está ocupado, el frontend te preguntará si quieres usar otro
- Si el puerto 5000 está ocupado, cambia en el backend .env: PORT=5001

### Error de JWT
El JWT_SECRET puede ser cualquier texto que elijas, por ejemplo:
- miClaveSecreta123
- marketplace_jwt_2024
- cualquier_texto_secreto

### Problemas con Caracteres Especiales
Si encuentras problemas con los caracteres especiales (como tildes o ñ):
1. Verifica que la base de datos tenga configuración UTF-8:
```sql
ALTER DATABASE marketplace SET client_encoding TO 'UTF8';
```
2. Asegúrate de que los headers de la aplicación incluyan charset UTF-8:
```javascript
headers: {
  'Content-Type': 'application/json; charset=utf-8'
}
```

## Ayuda Adicional
Si encuentras problemas, verifica:
1. Que todos los archivos .env estén creados correctamente
2. Que PostgreSQL esté corriendo
3. Que todas las dependencias estén instaladas
4. Que los puertos 3000 y 5000 estén libres
