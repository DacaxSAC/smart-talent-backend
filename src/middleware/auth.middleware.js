const jwt = require('jsonwebtoken');
const { User, Role } = require('../models');

// Middleware para verificar token JWT
const authMiddleware = async (req, res, next) => {
  try {
    // Verificar si existe el token en los headers
    const token = req.headers['x-access-token'] || req.headers['authorization'];
    if (!token) {
      return res.status(401).json({ message: 'No se proporcionó token de autenticación' });
    }

    // Eliminar 'Bearer ' si existe
    const tokenValue = token.startsWith('Bearer ') ? token.slice(7, token.length) : token;

    // Verificar token
    const decoded = jwt.verify(tokenValue, process.env.JWT_SECRET);
    
    // Verificar si el usuario existe
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] },
      include: [{
        model: Role,
        through: { attributes: [] } // No incluir atributos de la tabla intermedia
      }]
    });
    
    if (!user) {
      return res.status(401).json({ message: 'Usuario no encontrado' });
    }

    // Verificar si el usuario está activo
    if (!user.active) {
      return res.status(401).json({ message: 'Usuario desactivado. Contacte al administrador' });
    }

    // Obtener los nombres de los roles del usuario desde la relación
    const userRoles = user.Roles ? user.Roles.map(role => role.name) : [];

    // Agregar información del usuario al request
    req.userId = user.id;
    req.userRoles = userRoles;
    next();
  } catch (error) {
    console.error('Error de autenticación:', error);
    return res.status(401).json({ message: 'Token inválido o expirado' });
  }
};


// Middleware para verificar roles
const roleMiddleware = (roles) => {
  return (req, res, next) => {
    try {
      // Verificar si el usuario tiene alguno de los roles requeridos
      const hasRole = req.userRoles.some(role => roles.includes(role));
      if (!hasRole) {
        return res.status(403).json({ message: 'Acceso denegado. No tiene los permisos necesarios' });
      }
      next();
    } catch (error) {
      console.error('Error al verificar roles:', error);
      return res.status(500).json({ message: 'Error al verificar permisos' });
    }
  };
};

module.exports = { authMiddleware, roleMiddleware };