const { Request, Person, Document, Resource, Entity, DocumentType, ResourceType } = require('../models');
const { validationResult } = require('express-validator');
const { sequelize } = require('../config/database');
const RequestService = require('../services/request.service');

const RequestController = {
  // Crear una nueva solicitud con personas, documentos y recursos
  create: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const request = await RequestService.createRequest(req.body);

      res.status(201).json({
        message: 'Solicitud creada exitosamente',
        requestId: request.id
      });
    } catch (error) {
      console.error('Error al crear solicitud:', error);
      const statusCode = error.message === 'Entidad no encontrada' ? 404 : 500;
      res.status(statusCode).json({ message: error.message });
    }
  },

  // Obtener todas las personas de una entidad específica con sus solicitudes, documentos y recursos
  getAllPersonsByEntityId: async (req, res) => {
    try {
      const { entityId } = req.params;
      const peopleWithStatus = await RequestService.getPersonsByEntityId(entityId);
      res.status(200).json(peopleWithStatus);
    } catch (error) {
      console.error('Error al obtener personas por entidad:', error);
      res.status(500).json({ message: error.message });
    }
  },

  // Obtener todas las personas con sus entidades, documentos y recursos
  getAllPeople: async (req, res) => {
    try {
      const peopleWithEntities = await RequestService.getAllPeopleWithEntities();
      res.status(200).json(peopleWithEntities);
    } catch (error) {
      console.error('Error al obtener todas las personas:', error);
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = { RequestController };