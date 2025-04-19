#!/bin/bash

echo "Construyendo aplicación para producción..."

# Construir el frontend
cd frontend
npm run build
cd ..

# Copiar archivos del frontend al directorio público del backend
mkdir -p backend/public
cp -r frontend/build/* backend/public/

echo "Aplicación construida con éxito!"
echo "Para iniciar en producción: cd backend && NODE_ENV=production npm start"
