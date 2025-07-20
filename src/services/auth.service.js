const { User, Role } = require('../models');
const { Op } = require('sequelize');
const jwt = require('jsonwebtoken');

const AuthService = {
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

    // Obtener el rol por defecto
    const defaultRole = await Role.findOne({ where: { name: 'USER' } });
    if (!defaultRole) {
      throw new Error('Error al asignar rol por defecto: Rol USER no encontrado');
    }

    // Crear el usuario
    const user = await User.create({
      username,
      email,
      password,
    });

    // Asignar rol al usuario
    await user.setRoles([defaultRole]);

    // Obtener el usuario con roles
    const userWithRoles = await User.findByPk(user.id, {
      include: [{
        model: Role,
        attributes: ['name'],
        through: { attributes: [] }
      }]
    });

    const roleNames = userWithRoles.Roles.map(role => role.name);

    // Generar token
    const token = this.generateToken(user.id, roleNames);

    return {
      message: 'Usuario registrado exitosamente',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        roles: roleNames
      },
      token
    };
  },

  async loginUser(credentials) {
    const { email, password } = credentials;

    // Buscar usuario por email
    const user = await User.findOne({
      where: { email },
      include: [{
        model: Role,
        attributes: ['name'],
        through: { attributes: [] }
      }]
    });

    if (!user) {
      return {
        success: false,
        message: 'Credenciales inválidas'
      };
    }

    // Verificar contraseña
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return {
        success: false,
        message: 'Credenciales inválidas'
      };
    }

    // Verificar si el usuario está activo
    if (!user.active) {
      return {
        success: false,
        message: 'Usuario inactivo'
      };
    }

    const roleNames = user.Roles.map(role => role.name);

    // Generar token
    const token = this.generateToken(user.id, roleNames);

    return {
      success: true,
      message: 'Inicio de sesión exitoso',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        roles: roleNames
      },
      token
    };
  },

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
      roles: user.Roles.map(role => ({ name: role.name, description: role.description }))
    };
  },

  generateToken(userId, roles) {
    return jwt.sign(
      { 
        userId: userId, 
        roles: roles 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
  }
};

module.exports = AuthService;