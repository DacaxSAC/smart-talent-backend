const { User, Role } = require('../models'); // Importar modelos y sequelize
const { Op } = require('sequelize'); // Importar Op de sequelize
const { validationResult } = require('express-validator');

const UserController = {
  // Crear un nuevo usuario
  create: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { username, email, password, roles } = req.body;

      const userExists = await User.findOne({
        where: {
          [Op.or]: [{ email: email }, { username: username }],
          active: true
        }
      });
      if (userExists) {
        return res.status(400).json({ message: 'El usuario o correo electrónico ya está registrado' });
      }

      let userRoles = [];
      if (roles && roles.length > 0) {
        const foundRoles = await Role.findAll({
          where: {
            name: {
              [Op.in]: roles
            }
          }
        });
        userRoles = foundRoles;
      } else {
        const defaultRole = await Role.findOne({ where: { name: 'USER' } });
        if (defaultRole) {
          userRoles = [defaultRole];
        }
      }

      const user = await User.create({
        username,
        email,
        password,
      });

      if (userRoles.length > 0) {
        await user.setRoles(userRoles);
      }

      const userWithRoles = await User.findByPk(user.id, {
        include: [{
          model: Role,
          attributes: ['name', 'description'],
          through: { attributes: [] }
        }]
      });

      res.status(201).json({
        message: 'Usuario creado exitosamente',
        user: {
          id: userWithRoles.id,
          username: userWithRoles.username,
          email: userWithRoles.email,
          roles: userWithRoles.Roles.map(role => role.name)
        }
      });
    } catch (error) {
      console.error('Error al crear usuario:', error);
      res.status(500).json({ message: 'Error al crear usuario', error: error.message });
    }
  },

  // Obtener todos los usuarios
  getAll: async (req, res) => {
    try {
      const users = await User.findAll({
        attributes: { exclude: ['password'] }, // Excluir la contraseña
        where: { active: true }, // Solo usuarios activos
        include: [{
          model: Role,
          attributes: ['name', 'description'],
          through: { attributes: [] } // Excluir la tabla intermedia UserRoles
        }]
      });
      res.status(200).json(users);
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      res.status(500).json({ message: 'Error al obtener usuarios', error: error.message });
    }
  },

  // Obtener un usuario por ID
  getById: async (req, res) => {
    try {
      const user = await User.findByPk(req.params.id, {
        attributes: { exclude: ['password'] },
        where: { active: true },
        include: [{
          model: Role,
          attributes: ['name', 'description'],
          through: { attributes: [] } // Excluir la tabla intermedia UserRoles
        }]
      });
      if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }
      res.status(200).json(user);
    } catch (error) {
      console.error('Error al obtener usuario:', error);
      res.status(500).json({ message: 'Error al obtener usuario', error: error.message });
    }
  },

  // Actualizar un usuario
  update: async (req, res) => {
    try {
      // Verificar errores de validación
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { firstName, lastName, roles } = req.body;

      // Buscar usuario
      let user = await User.findAll({ where: { id: req.params.id, active: true } });
      if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }

      // Actualizar roles si se proporcionan
      if (roles && roles.length > 0) {
        const userRoles = await Role.findAll({
          where: {
            name: {
              [Op.in]: roles
            }
          }
        });
        await user.setRoles(userRoles); // Método de asociación many-to-many
      }

      // Actualizar datos
      user.firstName = firstName !== undefined ? firstName : user.firstName;
      user.lastName = lastName !== undefined ? lastName : user.lastName;
      // Sequelize maneja updatedAt automáticamente si timestamps es true

      await user.save();

      // Recargar el usuario con los roles asociados para la respuesta
      const userWithRoles = await User.findByPk(user.id, {
        include: [{
          model: Role,
          attributes: ['name', 'description'],
          through: { attributes: [] } // Excluir la tabla intermedia UserRoles
        }]
      });

      res.status(200).json({
        message: 'Usuario actualizado exitosamente',
        user: {
          id: userWithRoles.id,
          username: userWithRoles.username,
          email: userWithRoles.email,
          firstName: userWithRoles.firstName,
          lastName: userWithRoles.lastName,
          roles: userWithRoles.Roles.map(role => role.name) // Mapear a solo nombres de rol
        }
      });
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      res.status(500).json({ message: 'Error al actualizar usuario', error: error.message });
    }
  },

  // Eliminar un usuario (soft delete)
  delete: async (req, res) => {
    try {
      const user = await User.find({ where: { id: req.params.id, active: true } });
      if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }

      user.active = false;
      await user.save();

      res.status(200).json({
        message: 'Usuario desactivado exitosamente',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          active: user.active
        }
      });
    } catch (error) {
      console.error('Error al desactivar usuario:', error);
      res.status(500).json({ message: 'Error al desactivar usuario', error: error.message });
    }
  }
};

module.exports = { UserController };