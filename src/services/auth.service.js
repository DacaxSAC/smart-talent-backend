const { User, Role } = require('../models');
const { Op } = require('sequelize');
const jwt = require('jsonwebtoken');

const AuthService = {
  /**
   * Registra un nuevo usuario con rol por defecto
   */
  async registerUser(userData) {
    const { username, email, password } = userData;

    // Verificar si el usuario ya existe
    const userExists = await User.findOne({
      where: {
        [Op.or]: [{ email: email }, { username: username }]
      }
    });
    
    if (userExists) {
      throw new Error('El usuario o correo electrónico ya está registrado');
    }

    // Obtener rol por defecto
    const defaultRole = await Role.findOne({ where: { name: 'USER' } });
    if (!defaultRole) {
      throw new Error('Error al asignar rol por defecto: Rol USER no encontrado');
    }

    // Crear usuario
    const user = await User.create({
      username,
      email,
      password,
    });

    // Asignar rol
    await user.setRoles([defaultRole]);

    // Obtener usuario con roles
    const userWithRoles = await User.findByPk(user.id, {
      include: [{
        model: Role,
        attributes: ['name'],
        through: { attributes: [] }
      }]
    });

    const roleNames = userWithRoles.Roles.map(role => role.name);

    // Generar token
    const token = this.generateToken(userWithRoles.id, roleNames);

    return {
      token,
      user: {
        id: userWithRoles.id,
        username: userWithRoles.username,
        email: userWithRoles.email,
        entityId: userWithRoles.entityId,
        roles: roleNames
      }
    };
  },

  /**
   * Autentica un usuario
   */
  async loginUser(credentials) {
    const { email, password } = credentials;

    // Buscar usuario con roles
    const user = await User.findOne({
      where: { email: email },
      attributes: { include: ['password'] },
      include: [{
        model: Role,
        attributes: ['name'],
        through: { attributes: [] }
      }]
    });

    if (!user) {
      throw new Error('Credenciales inválidas');
    }

    // Verificar contraseña
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new Error('Credenciales inválidas');
    }

    // Verificar si está activo
    if (!user.active) {
      throw new Error('Usuario desactivado. Contacte al administrador');
    }

    const roleNames = user.Roles.map(role => role.name);
    const token = this.generateToken(user.id, roleNames);

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        entityId: user.entityId,
        roles: roleNames
      }
    };
  },

  /**
   * Obtiene el perfil de un usuario
   */
  async getUserProfile(userId) {
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] },
      include: [{
        model: Role,
        attributes: ['name', 'description'],
        through: { attributes: [] }
      }]
    });

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      roles: user.Roles.map(role => ({ 
        name: role.name, 
        description: role.description 
      }))
    };
  },

  /**
   * Genera un token JWT
   */
  generateToken(userId, roles) {
    return jwt.sign(
      { id: userId, roles: roles },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );
  }
};

module.exports = AuthService;