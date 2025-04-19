import React, { createContext, useState, useContext, useCallback } from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';
import appConfig from '../config/appConfig';

// Crear contexto
const NotificationContext = createContext();

// Tipos de notificación
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'danger',
  INFO: 'info',
  WARNING: 'warning'
};

/**
 * Proveedor de notificaciones para la aplicación
 */
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  /**
   * Añade una nueva notificación
   */
  const addNotification = useCallback((message, type = NOTIFICATION_TYPES.INFO, timeout = appConfig.ui.notificationDuration) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    
    setNotifications(prev => [
      ...prev,
      { id, message, type, timeout }
    ]);
    
    // Eliminar automáticamente después del tiempo especificado
    if (timeout !== 0) {
      setTimeout(() => {
        removeNotification(id);
      }, timeout);
    }
    
    return id;
  }, []);

  /**
   * Elimina una notificación por ID
   */
  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  // Métodos de conveniencia para diferentes tipos de notificaciones
  const showSuccess = useCallback((message, timeout) => {
    return addNotification(message, NOTIFICATION_TYPES.SUCCESS, timeout);
  }, [addNotification]);

  const showError = useCallback((message, timeout) => {
    return addNotification(message, NOTIFICATION_TYPES.ERROR, timeout);
  }, [addNotification]);

  const showInfo = useCallback((message, timeout) => {
    return addNotification(message, NOTIFICATION_TYPES.INFO, timeout);
  }, [addNotification]);

  const showWarning = useCallback((message, timeout) => {
    return addNotification(message, NOTIFICATION_TYPES.WARNING, timeout);
  }, [addNotification]);

  // Valor del contexto
  const value = {
    addNotification,
    removeNotification,
    showSuccess,
    showError,
    showInfo,
    showWarning
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      
      <ToastContainer position="top-end" className="p-3" style={{ zIndex: 9999 }}>
        {notifications.map(({ id, message, type }) => (
          <Toast key={id} onClose={() => removeNotification(id)} bg={type}>
            <Toast.Header>
              <strong className="me-auto">
                {type === NOTIFICATION_TYPES.SUCCESS && '✅ Éxito'}
                {type === NOTIFICATION_TYPES.ERROR && '❌ Error'}
                {type === NOTIFICATION_TYPES.INFO && 'ℹ️ Información'}
                {type === NOTIFICATION_TYPES.WARNING && '⚠️ Advertencia'}
              </strong>
            </Toast.Header>
            <Toast.Body className={type === NOTIFICATION_TYPES.SUCCESS || type === NOTIFICATION_TYPES.ERROR ? 'text-white' : ''}>
              {message}
            </Toast.Body>
          </Toast>
        ))}
      </ToastContainer>
    </NotificationContext.Provider>
  );
};

/**
 * Hook para usar notificaciones en componentes
 */
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification debe ser utilizado dentro de un NotificationProvider');
  }
  return context;
};
