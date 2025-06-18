const { Role, User } = require('../models');
const { validationResult } = require('express-validator');

const RoleController = {
  // Crear un nuevo rol
  create: async (req, res) => {
    try {
      // Verificar errores de validación
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, description, permissions } = req.body;

      // Verificar si el rol ya existe
      const roleExists = await Role.findOne({ 
        where: { name }
      });
      if (roleExists) {
        return res.status(400).json({ message: 'El rol ya existe' });
      }

      // Crear nuevo rol
      const role = await Role.create({
        name,
        description,
        permissions
      });

      res.status(201).json({
        message: 'Rol creado exitosamente',
        role
      });
    } catch (error) {
      console.error('Error al crear rol:', error);
      res.status(500).json({ message: 'Error al crear rol', error: error.message });
    }
  },

  // Obtener todos los roles
  getAll: async (req, res) => {
    try {
      const roles = await Role.findAll();
      res.status(200).json(roles);
    } catch (error) {
      console.error('Error al obtener roles:', error);
      res.status(500).json({ message: 'Error al obtener roles', error: error.message });
    }
  },

  // Obtener un rol por ID
  getById: async (req, res) => {
    try {
      const role = await Role.findByPk(req.params.id);
      if (!role) {
        return res.status(404).json({ message: 'Rol no encontrado' });
      }
      res.status(200).json(role);
    } catch (error) {
      console.error('Error al obtener rol:', error);
      res.status(500).json({ message: 'Error al obtener rol', error: error.message });
    }
  },

  // Actualizar un rol
  update: async (req, res) => {
    try {
      // Verificar errores de validación
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { description, permissions } = req.body;
      
      // Buscar rol
      let role = await Role.findByPk(req.params.id);
      if (!role) {
        return res.status(404).json({ message: 'Rol no encontrado' });
      }

      // Actualizar datos
      role.description = description || role.description;
      role.permissions = permissions || role.permissions;
      
      await role.save();

      res.status(200).json({
        message: 'Rol actualizado exitosamente',
        role
      });
    } catch (error) {
      console.error('Error al actualizar rol:', error);
      res.status(500).json({ message: 'Error al actualizar rol', error: error.message });
    }
  },

  // Eliminar un rol
  delete: async (req, res) => {
    try {
      const role = await Role.findByPk(req.params.id, {
        include: [{
          model: User,
          through: { attributes: [] }
        }]
      });

      if (!role) {
        return res.status(404).json({ message: 'Rol no encontrado' });
      }

      // Verificar si es un rol predeterminado del sistema
      if (['ADMIN', 'MANAGER', 'USER'].includes(role.name)) {
        return res.status(400).json({ message: 'No se puede eliminar un rol predeterminado del sistema' });
      }

      // Verificar si hay usuarios con este rol
      if (role.Users && role.Users.length > 0) {
        return res.status(400).json({ 
          message: 'No se puede eliminar el rol porque hay usuarios asignados a él',
          usersCount: role.Users.length
        });
      }

      await role.destroy();
      res.status(200).json({ message: 'Rol eliminado exitosamente' });
    } catch (error) {
      console.error('Error al eliminar rol:', error);
      res.status(500).json({ message: 'Error al eliminar rol', error: error.message });
    }
  }
};

module.exports = { RoleController };