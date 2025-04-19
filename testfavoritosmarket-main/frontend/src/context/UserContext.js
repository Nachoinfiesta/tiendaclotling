import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

export const UserContext = createContext();

// Custom hook para usar el contexto de usuario más fácilmente
export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser debe ser usado dentro de un UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cargar usuario desde localStorage al iniciar
  useEffect(() => {
    const loadUserFromStorage = () => {
      try {
        // Verificar si hay un usuario almacenado
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
          console.log('No hay usuario almacenado en localStorage');
          setLoading(false);
          return;
        }

        // Intentar analizar el JSON
        const parsedUser = JSON.parse(storedUser);
        
        // Verificar que el objeto del usuario tiene las propiedades necesarias
        if (!parsedUser.id || !parsedUser.token) {
          console.warn('Datos de usuario incompletos en localStorage, limpiando...');
          localStorage.removeItem('user');
          setLoading(false);
          return;
        }

        // Establecer el usuario en el contexto
        setUser(parsedUser);
        console.log('Usuario cargado desde localStorage:', {
          id: parsedUser.id,
          nombre: parsedUser.nombre,
          tokenPresente: !!parsedUser.token
        });

        // Validar el token con una llamada al backend
        validateToken(parsedUser.token);
      } catch (error) {
        console.error('Error al cargar usuario desde localStorage:', error);
        localStorage.removeItem('user');
        setLoading(false);
      }
    };

    // Función para validar el token con el backend
    const validateToken = async (token) => {
      try {
        // Configurar el header de autorización
        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };
        
        // Intentar obtener datos del perfil para validar el token
        await axios.get('/api/auth/profile', config);
        // Si llegamos aquí, el token es válido
        setLoading(false);
      } catch (error) {
        console.warn('Token inválido o expirado, cerrando sesión...');
        // Si hay un error, el token no es válido
        localStorage.removeItem('user');
        setUser(null);
        setLoading(false);
      }
    };

    loadUserFromStorage();
  }, []);

  // Función para iniciar sesión
  const login = (userData) => {
    // Validar que el objeto de usuario contiene los datos necesarios
    if (!userData || !userData.user || !userData.token) {
      console.error('Datos de login incompletos:', userData);
      return;
    }

    // Crear un objeto de usuario completo con toda la información necesaria
    const userToStore = {
      id: userData.user.id,
      nombre: userData.user.nombre,
      email: userData.user.email,
      foto_perfil: userData.user.foto_perfil,
      token: userData.token
    };

    console.log('Guardando datos de usuario en contexto:', {
      id: userToStore.id,
      nombre: userToStore.nombre,
      tokenPresente: !!userToStore.token
    });

    // Actualizar el estado y guardar en localStorage
    setUser(userToStore);
    localStorage.setItem('user', JSON.stringify(userToStore));
  };

  // Función para cerrar sesión
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    console.log('Sesión cerrada, usuario eliminado del contexto');
  };

  return (
    <UserContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </UserContext.Provider>
  );
};