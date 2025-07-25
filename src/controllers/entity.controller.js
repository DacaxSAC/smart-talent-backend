const { validationResult } = require('express-validator');
const EntityService = require('../services/entity.service');

const EntityController = {
  create: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const result = await EntityService.createEntityWithUser(req.body);

      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Obtener todas las entidades
  getAll: async (req, res) => {
    try {
      const entities = await EntityService.getAllEntities();
      res.status(200).json(entities);
    } catch (error) {
      console.error('Error al obtener entidades:', error);
      res.status(500).json({ message: error.message });
    }
  },

  // Obtener una entidad por ID
  getById: async (req, res) => {
    try {
      const entity = await EntityService.getEntityById(req.params.id);
      res.status(200).json(entity);
    } catch (error) {
      console.error('Error al obtener entidad:', error);
      const statusCode = error.message === 'Entidad no encontrada' ? 404 : 500;
      res.status(statusCode).json({ message: error.message });
    }
  },

  // Actualizar una entidad
  update: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const entity = await EntityService.updateEntity(req.params.id, req.body);

      res.status(200).json({
        message: 'Entidad actualizada exitosamente',
        entity
      });
    } catch (error) {
      console.error('Error al actualizar entidad:', error);
      const statusCode = error.message === 'Entidad no encontrada' ? 404 : 
                        error.message === 'Ya existe una entidad con este número de documento' ? 400 : 500;
      res.status(statusCode).json({ message: error.message });
    }
  },

  // Eliminar una entidad (soft delete)
  delete: async (req, res) => {
    try {
      const result = await EntityService.deleteEntity(req.params.id);
      res.status(200).json(result);
    } catch (error) {
      console.error('Error al eliminar entidad:', error);
      let statusCode = 500;
      
      if (error.message === 'Entidad no encontrada') {
        statusCode = 404;
      } else if (error.message === 'La entidad ya está eliminada') {
        statusCode = 400;
      }
      
      res.status(statusCode).json({ message: error.message });
    }
  },

  // Reactivar una entidad y su usuario asociado
  reactivate: async (req, res) => {
    try {
      const result = await EntityService.reactivateEntity(req.params.id);
      res.status(200).json(result);
    } catch (error) {
      console.error('Error al reactivar entidad:', error);
      let statusCode = 500;
      
      if (error.message === 'Entidad no encontrada') {
        statusCode = 404;
      }
      
      res.status(statusCode).json({ message: error.message });
    }
  }

};

module.exports = { EntityController };