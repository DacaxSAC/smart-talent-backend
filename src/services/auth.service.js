const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const { sendEmailResetPassword } = require('./email.service');
const { JWT_SECRET, JWT_EXPIRE, FRONTEND_URL } = require('../config/env-variable');
const { User, Role } = require('../models');

const AuthService = {
  generateToken(userId, roles) {
    return jwt.sign(
      { 
        userId: userId, 
        roles: roles 
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRE }
    );
  },

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
        roles: roleNames,
        entityId:user.entityId
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

  async requestPasswordReset(email) {
    // Buscar usuario por email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return{
        message: 'Se ha enviado un correo con las instrucciones para restablecer tu contraseña'
      }
    }

    // Generar token de reset
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hora

    // Guardar token en la base de datos
    await user.update({
      resetPasswordToken: resetToken,
      resetPasswordExpires: resetTokenExpiry
    });

    // Enviar email con el token
    const resetUrl = `${FRONTEND_URL}/reset-password?token=${resetToken}`;
    console.log(resetUrl);
    console.log(user.email, user.username)
    await sendEmailResetPassword(user.email, user.username, resetUrl);

    return {
      message: 'Se ha enviado un correo con las instrucciones para restablecer tu contraseña'
    };
  },

  async validateResetToken(token) {
    const user = await User.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: {
          [Op.gt]: new Date()
        }
      }
    });

    return {
      valid: !!user,
      message: user ? 'Token válido' : 'Token inválido o expirado'
    };
  },

  async resetPassword(token, newPassword) {
    // Buscar usuario con token válido
    const user = await User.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: {
          [Op.gt]: new Date()
        }
      }
    });

    if (!user) {
      return{
        success: false,
        message: 'Token inválido o expirado'
      }
    }

    // Hashear nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar contraseña y limpiar tokens
    await user.update({
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null
    });

    return { 
      success: true,
      message: 'Contraseña restablecida exitosamente'
    };
  }
};

module.exports = AuthService;