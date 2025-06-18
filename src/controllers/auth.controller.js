const { User, Role, sequelize } = require('../models'); // Importar modelos y sequelize
const { Op } = require('sequelize'); // Importar Op de sequelize
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

const AuthController = {
  // Registro de usuario
  register: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { username, email, password } = req.body;

      const userExists = await User.findOne({
        where: {
          [Op.or]: [{ email: email }, { username: username }]
        }
      });
      if (userExists) {
        return res.status(400).json({ message: 'El usuario o correo electrónico ya está registrado' });
      }

      const defaultRole = await Role.findOne({ where: { name: 'USER' } });
      if (!defaultRole) {
        return res.status(500).json({ message: 'Error al asignar rol por defecto: Rol USER no encontrado' });
      }

      const user = await User.create({
        username,
        email,
        password,
      });

      await user.setRoles([defaultRole]);

      const userWithRoles = await User.findByPk(user.id, {
        include: [{
          model: Role,
          attributes: ['name'],
          through: { attributes: [] }
        }]
      });

      const roleNames = userWithRoles.Roles.map(role => role.name);

      const token = jwt.sign(
        { id: userWithRoles.id, roles: roleNames },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE }
      );

      res.status(201).json({
        message: 'Usuario registrado exitosamente',
        token,
        user: {
          id: userWithRoles.id,
          username: userWithRoles.username,
          email: userWithRoles.email,
          entityId: userWithRoles.entityId,
          roles: roleNames
        }
      });
    } catch (error) {
      console.error('Error al registrar usuario:', error);
      res.status(500).json({ message: 'Error al registrar usuario', error: error.message });
    }
  },

  // Inicio de sesión
  login: async (req, res) => {
    try {
      // Verificar errores de validación
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      // Buscar usuario por email e incluir la contraseña y roles
      const user = await User.findOne({
        where: { email: email },        attributes: { include: ['password'] }, // Include password for comparison and id for related entity

        include: [{
          model: Role,
          attributes: ['name'], // Solo necesitamos el nombre del rol
          through: { attributes: [] } // Excluir la tabla intermedia UserRoles
        }]
      });

      if (!user) {
        return res.status(401).json({ message: 'Credenciales inválidas' });
      }

      // Verificar contraseña (asumiendo que comparePassword es un método del modelo Sequelize)
      const isMatch = await user.comparePassword(password);
      
      if (!isMatch) {
        return res.status(401).json({ message: 'Credenciales inválidas' });
      }

      // Verificar si el usuario está activo
      if (!user.active) {
        return res.status(401).json({ message: 'Usuario desactivado. Contacte al administrador' });
      }

      // Obtener nombres de roles
      const roleNames = user.Roles.map(role => role.name);

      // Generar token JWT
      const token = jwt.sign(
        { id: user.id, roles: roleNames },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE }
      );

      res.status(200).json({
        message: 'Inicio de sesión exitoso',
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
      });
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      res.status(500).json({ message: 'Error al iniciar sesión', error: error.message });
    }
  },

  // Obtener perfil del usuario actual
  getProfile: async (req, res) => {
    try {
      // req.userId debe ser establecido por un middleware de autenticación
      const user = await User.findByPk(req.userId, {
        attributes: { exclude: ['password'] }, // Excluir la contraseña
        include: [{
          model: Role,
          attributes: ['name', 'description'],
          through: { attributes: [] } // Excluir la tabla intermedia UserRoles
        }]
      });

      if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }

      // Formatear la respuesta para incluir solo los nombres de los roles si es necesario,
      // o devolver el objeto user con los roles incluidos.
      // Aquí devolvemos el objeto user con los roles completos (nombre y descripción)
      res.status(200).json({
        id: user.id,
        username: user.username,
        email: user.email,
        roles: user.Roles.map(role => ({ name: role.name, description: role.description }))
      });

    } catch (error) {
      console.error('Error al obtener perfil:', error);
      res.status(500).json({ message: 'Error al obtener perfil', error: error.message });
    }
  }
};

module.exports = { AuthController };