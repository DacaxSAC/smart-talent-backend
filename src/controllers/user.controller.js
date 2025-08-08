const { validationResult } = require('express-validator');
const UserService = require('../services/user.service');

const UserController = {
  // Crear un nuevo usuario
  create: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const user = await UserService.createUser(req.body);

      res.status(201).json({
        message: 'Usuario creado exitosamente',
        user
      });
    } catch (error) {
      console.error('Error al crear usuario:', error);
      res.status(500).json({ message: error.message });
    }
  },

  // Obtener todos los usuarios
  getAll: async (req, res) => {
    try {
      const users = await UserService.getAllUsers();
      res.status(200).json(users);
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      res.status(500).json({ message: error.message });
    }
  },

  // Obtener un usuario por ID
  getById: async (req, res) => {
    try {
      const user = await UserService.getUserById(req.params.id);
      res.status(200).json(user);
    } catch (error) {
      console.error('Error al obtener usuario:', error);
      const statusCode = error.message === 'Usuario no encontrado' ? 404 : 500;
      res.status(statusCode).json({ message: error.message });
    }
  },

  // Actualizar un usuario
  update: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const user = await UserService.updateUser(req.params.id, req.body);

      res.status(200).json({
        message: 'Usuario actualizado exitosamente',
        user
      });
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      const statusCode = error.message === 'Usuario no encontrado' ? 404 : 500;
      res.status(statusCode).json({ message: error.message });
    }
  },

  // Eliminar un usuario (soft delete)
  delete: async (req, res) => {
    try {
      const user = await UserService.deleteUser(req.params.id);

      res.status(200).json({
        message: 'Usuario desactivado exitosamente',
        user
      });
    } catch (error) {
      console.error('Error al desactivar usuario:', error);
      const statusCode = error.message === 'Usuario no encontrado' ? 404 : 500;
      res.status(statusCode).json({ message: error.message });
    }
  },

  // Alternar estado active del usuario
  toggleStatus: async (req, res) => {
    try {
      const result = await UserService.toggleUserStatus(req.params.id);

      res.status(200).json(result);
    } catch (error) {
      console.error('Error al cambiar estado del usuario:', error);
      const statusCode = error.message === 'Usuario no encontrado' ? 404 : 500;
      res.status(statusCode).json({ message: error.message });
    }
  }
};

module.exports = { UserController };