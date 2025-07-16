const { Role, User } = require('../models');
const { validationResult } = require('express-validator');
const RoleService = require('../services/role.service');

const RoleController = {
  // Crear un nuevo rol
  create: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const role = await RoleService.createRole(req.body);

      res.status(201).json({
        message: 'Rol creado exitosamente',
        role
      });
    } catch (error) {
      console.error('Error al crear rol:', error);
      const statusCode = error.message === 'El rol ya existe' ? 400 : 500;
      res.status(statusCode).json({ message: error.message });
    }
  },

  // Obtener todos los roles
  getAll: async (req, res) => {
    try {
      const roles = await RoleService.getAllRoles();
      res.status(200).json(roles);
    } catch (error) {
      console.error('Error al obtener roles:', error);
      res.status(500).json({ message: error.message });
    }
  },

  // Obtener un rol por ID
  getById: async (req, res) => {
    try {
      const role = await RoleService.getRoleById(req.params.id);
      res.status(200).json(role);
    } catch (error) {
      console.error('Error al obtener rol:', error);
      const statusCode = error.message === 'Rol no encontrado' ? 404 : 500;
      res.status(statusCode).json({ message: error.message });
    }
  },

  // Actualizar un rol
  update: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const role = await RoleService.updateRole(req.params.id, req.body);

      res.status(200).json({
        message: 'Rol actualizado exitosamente',
        role
      });
    } catch (error) {
      console.error('Error al actualizar rol:', error);
      const statusCode = error.message === 'Rol no encontrado' ? 404 : 
                        error.message.includes('predeterminado') || 
                        error.message.includes('Ya existe') ? 400 : 500;
      res.status(statusCode).json({ message: error.message });
    }
  },

  // Eliminar un rol
  delete: async (req, res) => {
    try {
      const result = await RoleService.deleteRole(req.params.id);
      res.status(200).json(result);
    } catch (error) {
      console.error('Error al eliminar rol:', error);
      const statusCode = error.message === 'Rol no encontrado' ? 404 : 
                        error.message.includes('predeterminado') || 
                        error.message.includes('usuarios asignados') ? 400 : 500;
      res.status(statusCode).json({ message: error.message });
    }
  }
};

module.exports = { RoleController };