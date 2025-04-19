import React from 'react';
import { Breadcrumb } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';

const BreadcrumbNav = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(x => x);
  
  // Mapeo de rutas a nombres más amigables para el usuario
  const routeNameMap = {
    'home': 'Inicio',
    'search': 'Búsqueda',
    'post': 'Publicación',
    'profile': 'Perfil',
    'favorites': 'Favoritos',
    'my-posts': 'Mis Publicaciones',
    'create-post': 'Crear Publicación',
    'edit-post': 'Editar Publicación',
    'cart': 'Carrito',
    'login': 'Iniciar Sesión',
    'register': 'Registro'
  };

  // Si estamos en la página principal, no mostrar breadcrumbs
  if (pathnames.length === 0 || (pathnames.length === 1 && pathnames[0] === 'home')) {
    return null;
  }

  return (
    <Breadcrumb className="mt-3 ms-3">
      <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/" }}>
        Inicio
      </Breadcrumb.Item>
      
      {pathnames.map((value, index) => {
        // Para construir la URL acumulativa
        const url = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;

        // Si es un ID (como en /post/123), mostrar sólo 'Detalle'
        const displayName = isNaN(value) ? (routeNameMap[value] || value) : 'Detalle';
        
        return isLast ? (
          <Breadcrumb.Item active key={url}>
            {displayName}
          </Breadcrumb.Item>
        ) : (
          <Breadcrumb.Item key={url} linkAs={Link} linkProps={{ to: url }}>
            {displayName}
          </Breadcrumb.Item>
        );
      })}
    </Breadcrumb>
  );
};

export default BreadcrumbNav;
