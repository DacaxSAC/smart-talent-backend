const { validationResult } = require('express-validator');
const RequestService = require('../services/request.service');

const RequestController = {
  create: async (req, res) => {
    try {
      // Validar entrada
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const result = await RequestService.createRequest(req.body);

      res.status(201).json(result);
    } catch (error) {
      console.error('Error al crear solicitud:', error);
      const statusCode = error.message === 'Entidad no encontrada' ? 404 : 500;
      res.status(statusCode).json({ 
        message: error.message === 'Entidad no encontrada' ? error.message : 'Error al crear la solicitud', 
        error: error.message 
      });
    }
  },

  // Obtener personas por entidad
  getPersonsByEntity: async (req, res) => {
    try {
      const { entityId } = req.params;
      const result = await RequestService.getPersonsByEntityId(entityId);
      res.status(200).json(result);
    } catch (error) {
      console.error('Error al obtener personas:', error);
      const statusCode = error.message === 'Entidad no encontrada' ? 404 : 500;
      res.status(statusCode).json({ 
        message: error.message === 'Entidad no encontrada' ? error.message : 'Error al obtener las personas', 
        error: error.message 
      });
    }
  },

  // Obtener todas las personas con su entidad
  getAllPeople: async (req, res) => {
    try {
      const result = await RequestService.getAllPeopleWithEntities();
      res.status(200).json(result);
    } catch (error) {
      console.error('Error al obtener personas:', error);
      res.status(500).json({ 
        message: 'Error al obtener las personas', 
        error: error.message 
      });
    }
  }
};

module.exports = { RequestController };