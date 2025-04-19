import React, { createContext, useState, useContext, useEffect } from 'react';

export const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe usarse dentro de CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  // Inicializar el carrito desde localStorage si existe
  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem('cart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      console.error('Error al cargar el carrito desde localStorage:', error);
      return [];
    }
  });
  
  const [itemCount, setItemCount] = useState(0);
  const [total, setTotal] = useState(0);

  // Actualizar localStorage y recalcular totales cuando cambia el carrito
  useEffect(() => {
    try {
      // Guardar en localStorage
      localStorage.setItem('cart', JSON.stringify(cart));
      
      // Calcular total de items
      const count = cart.reduce((sum, item) => sum + item.quantity, 0);
      setItemCount(count);
      
      // Calcular monto total
      const amount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      setTotal(amount);
    } catch (error) {
      console.error('Error al guardar el carrito:', error);
    }
  }, [cart]);

  // Añadir un producto al carrito
  const addToCart = (product) => {
    setCart(currentCart => {
      // Verificar si el producto ya está en el carrito
      const existingItem = currentCart.find(item => item.id === product.id);
      
      if (existingItem) {
        // Si existe, incrementar cantidad
        return currentCart.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      } else {
        // Si no existe, añadirlo con cantidad 1
        return [...currentCart, { ...product, quantity: 1 }];
      }
    });
  };

  // Eliminar un producto del carrito
  const removeFromCart = (productId) => {
    setCart(currentCart => currentCart.filter(item => item.id !== productId));
  };

  // Actualizar la cantidad de un producto
  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCart(currentCart => 
      currentCart.map(item => 
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  // Vaciar el carrito
  const clearCart = () => {
    setCart([]);
  };

  // Función para verificar si un producto está en el carrito
  const isProductInCart = (productId) => {
    return cart.some(item => item.id === productId);
  };

  // Valores y funciones proporcionados por el contexto
  const contextValue = {
    cart,
    itemCount,
    total,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    isProductInCart // Nueva función para verificar si un producto está en el carrito
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};
