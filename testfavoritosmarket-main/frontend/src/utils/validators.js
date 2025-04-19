/**
 * Conjunto de validadores para formularios
 */
export const formValidators = {
  /**
   * Valida si un email tiene formato correcto
   * @param {string} email - Email a validar
   * @returns {boolean} - true si el email es válido
   */
  isValidEmail: (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  },
  
  /**
   * Valida si un precio tiene formato correcto
   * @param {string|number} price - Precio a validar
   * @returns {boolean} - true si el precio es válido
   */
  isValidPrice: (price) => {
    const numPrice = Number(price);
    return !isNaN(numPrice) && numPrice > 0;
  },
  
  /**
   * Valida si un texto tiene la longitud mínima
   * @param {string} text - Texto a validar
   * @param {number} minLength - Longitud mínima
   * @returns {boolean} - true si el texto tiene longitud suficiente
   */
  hasMinLength: (text, minLength) => {
    return text && text.trim().length >= minLength;
  },
  
  /**
   * Valida si una URL tiene formato correcto
   * @param {string} url - URL a validar
   * @returns {boolean} - true si la URL es válida
   */
  isValidUrl: (url) => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  }
};
