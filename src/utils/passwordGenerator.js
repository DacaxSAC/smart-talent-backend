const crypto = require('crypto');

/**
 * Generador de contraseñas con múltiples opciones
 */
class PasswordGenerator {
  /**
   * Genera una contraseña aleatoria con configuración personalizable
   * @param {Object} options - Opciones de configuración
   * @param {number} options.length - Longitud de la contraseña (default: 12)
   * @param {boolean} options.uppercase - Incluir mayúsculas (default: true)
   * @param {boolean} options.lowercase - Incluir minúsculas (default: true)
   * @param {boolean} options.numbers - Incluir números (default: true)
   * @param {boolean} options.symbols - Incluir símbolos (default: true)
   * @param {string} options.exclude - Caracteres a excluir
   * @returns {string} Contraseña generada
   */
  static generate(options = {}) {
    const {
      length = 12,
      uppercase = true,
      lowercase = true,
      numbers = true,
      symbols = true,
      exclude = ''
    } = options;

    // Definir conjuntos de caracteres
    const chars = {
      uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      lowercase: 'abcdefghijklmnopqrstuvwxyz',
      numbers: '0123456789',
      symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
    };

    // Construir el conjunto de caracteres disponibles
    let availableChars = '';
    if (uppercase) availableChars += chars.uppercase;
    if (lowercase) availableChars += chars.lowercase;
    if (numbers) availableChars += chars.numbers;
    if (symbols) availableChars += chars.symbols;

    // Remover caracteres excluidos
    if (exclude) {
      availableChars = availableChars.split('').filter(char => !exclude.includes(char)).join('');
    }

    if (availableChars.length === 0) {
      throw new Error('No hay caracteres disponibles para generar la contraseña');
    }

    // Generar contraseña
    let password = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = crypto.randomInt(0, availableChars.length);
      password += availableChars[randomIndex];
    }

    return password;
  }

  /**
   * Genera una contraseña segura con configuración predefinida
   * @param {number} length - Longitud de la contraseña (default: 16)
   * @returns {string} Contraseña segura
   */
  static generateSecure(length = 16) {
    return this.generate({
      length,
      uppercase: true,
      lowercase: true,
      numbers: true,
      symbols: true
    });
  }

  /**
   * Genera una contraseña simple (solo letras y números)
   * @param {number} length - Longitud de la contraseña (default: 8)
   * @returns {string} Contraseña simple
   */
  static generateSimple(length = 8) {
    return this.generate({
      length,
      uppercase: true,
      lowercase: true,
      numbers: true,
      symbols: false
    });
  }

  /**
   * Genera una contraseña fácil de recordar (palabras separadas por símbolos)
   * @param {number} wordCount - Número de palabras (default: 4)
   * @returns {string} Contraseña memorable
   */
  static generateMemorable(wordCount = 4) {
    const words = [
      'apple', 'banana', 'cherry', 'dragon', 'eagle', 'forest', 'garden', 'house',
      'island', 'jungle', 'knight', 'lemon', 'mountain', 'ocean', 'planet', 'queen',
      'river', 'sunset', 'tiger', 'umbrella', 'village', 'window', 'yellow', 'zebra'
    ];

    const symbols = ['!', '@', '#', '$', '%', '^', '&', '*'];
    const numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

    let password = '';
    
    for (let i = 0; i < wordCount; i++) {
      // Seleccionar palabra aleatoria
      const randomWord = words[crypto.randomInt(0, words.length)];
      
      // Capitalizar la primera letra
      const capitalizedWord = randomWord.charAt(0).toUpperCase() + randomWord.slice(1);
      
      password += capitalizedWord;
      
      // Agregar símbolo o número entre palabras (excepto al final)
      if (i < wordCount - 1) {
        if (crypto.randomInt(0, 2) === 0) {
          password += symbols[crypto.randomInt(0, symbols.length)];
        } else {
          password += numbers[crypto.randomInt(0, numbers.length)];
        }
      }
    }

    return password;
  }

  /**
   * Valida la fortaleza de una contraseña
   * @param {string} password - Contraseña a validar
   * @returns {Object} Resultado de la validación
   */
  static validateStrength(password) {
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      numbers: /\d/.test(password),
      symbols: /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password),
      noCommonPatterns: !/(123|abc|qwe|password|admin)/i.test(password)
    };

    const score = Object.values(checks).filter(Boolean).length;
    let strength = 'débil';
    
    if (score >= 5) strength = 'fuerte';
    else if (score >= 3) strength = 'media';

    return {
      isValid: score >= 4,
      score,
      strength,
      checks
    };
  }
}

module.exports = PasswordGenerator; 