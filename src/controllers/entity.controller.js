const { Entity, User, Role, Request } = require('../models');
const { validationResult } = require('express-validator');
const EntityService = require('../services/entity.service');
const { Op } = require('sequelize');

const EntityController = {
  create: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const result = await EntityService.createEntityWithUser(req.body);

      res.status(201).json({
        message: 'Entidad y usuario creados exitosamente',
        ...result
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Obtener todas las entidades
  getAll: async (req, res) => {
    try {
      const entities = await Entity.findAll({
        include: [{
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email'],
          include: [{
            model: Role,
            attributes: ['name'],
            through: { attributes: [] }
          }]
        }]
      });
      res.status(200).json(entities);
    } catch (error) {
      console.error('Error al obtener entidades:', error);
      res.status(500).json({ message: 'Error al obtener entidades', error: error.message });
    }
  },

  // Obtener una entidad por ID
  getById: async (req, res) => {
    try {
      const entity = await Entity.findByPk(req.params.id, {
        include: [{
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email'],
          include: [{
            model: Role,
            attributes: ['name'],
            through: { attributes: [] }
          }]
        }]
      });
      if (!entity) {
        return res.status(404).json({ message: 'Entidad no encontrada' });
      }
      res.status(200).json(entity);
    } catch (error) {
      console.error('Error al obtener entidad:', error);
      res.status(500).json({ message: 'Error al obtener entidad', error: error.message });
    }
  },

  // Actualizar una entidad
  update: async (req, res) => {
    try {
      // Verificar errores de validación
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const changes = req.body;

      // Buscar entidad
      let entity = await Entity.findByPk(req.params.id);
      if (!entity) {
        return res.status(404).json({ message: 'Entidad no encontrada' });
      }

      // Verificar si el documento ya existe en otra entidad
      if (changes.documentNumber) {
        const existingEntity = await Entity.findOne({
          where: {
            documentNumber: changes.documentNumber,
            id: { [Op.ne]: req.params.id } // Excluir la entidad actual
          }
        });
        if (existingEntity) {
          return res.status(400).json({ message: 'Ya existe una entidad con este número de documento' });
        }
      }

      const updatedEntity = await Entity.update(changes, {
        where: {
          id: req.params.id
        }
      });

      // Si se proporciona email, actualizar el usuario asociado
      if (updatedEntity.email) {
        const user = await User.findOne({ where: { email: updatedEntity.email } });
        if (user) {
          user.email = updatedEntity.email;
          user.username = type === 'NATURAL' ? `${updatedEntity.firstName} ${updatedEntity.paternalSurname} ${updatedEntity.maternalSurname}` : businessName;
          await user.save();
        }
      }

      res.status(200).json({
        message: 'Entidad actualizada exitosamente',
        entity
      });
    } catch (error) {
      console.error('Error al actualizar entidad:', error);
      res.status(500).json({ message: 'Error al actualizar entidad', error: error.message });
    }
  },

  // Eliminar una entidad
  delete: async (req, res) => {
    try {
      const entity = await Entity.findByPk(req.params.id);
      if (!entity) {
        return res.status(404).json({ message: 'Entidad no encontrada' });
      }

      await entity.destroy();
      res.status(200).json({ message: 'Entidad eliminada exitosamente' });
    } catch (error) {
      console.error('Error al eliminar entidad:', error);
      res.status(500).json({ message: 'Error al eliminar entidad', error: error.message });
    }
  }
};

module.exports = { EntityController };