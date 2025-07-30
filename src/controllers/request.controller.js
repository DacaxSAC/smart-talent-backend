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
      let { status } = req.query;
      
      // Si status es un string con comas, convertir a array
      if (status && typeof status === 'string' && status.includes(',')) {
        status = status.split(',').map(s => s.trim());
      }
      
      const result = await RequestService.getAllPeopleWithEntities(status);
      res.status(200).json(result);
    } catch (error) {
      console.error('Error al obtener personas:', error);
      res.status(500).json({ 
        message: 'Error al obtener las personas', 
        error: error.message 
      });
    }
  },

  // Obtener una persona específica por ID
  getPersonById: async (req, res) => {
    try {
      const { personId } = req.params;
      
      if (!personId || isNaN(personId)) {
        return res.status(400).json({ 
          message: 'ID de persona inválido' 
        });
      }
      
      const result = await RequestService.getPersonById(parseInt(personId));
      res.status(200).json(result);
    } catch (error) {
      console.error('Error al obtener persona:', error);
      const statusCode = error.message === 'Persona no encontrada' ? 404 : 500;
      res.status(statusCode).json({ 
        message: error.message === 'Persona no encontrada' ? error.message : 'Error al obtener la persona', 
        error: error.message 
      });
    }
  },

 // Asignar recruiter y mover a IN_PROGRESS
 assignRecruiter: async (req, res) => {
   try {
     const { recruiterId, personId } = req.body;
     
     if (!recruiterId || !personId) {
       return res.status(400).json({ 
         message: 'ID de recruiter y ID de persona son requeridos' 
       });
     }

     const result = await RequestService.assignRecruiter(recruiterId, personId);
     res.status(200).json(result);
   } catch (error) {
     console.error('Error al asignar recruiter y actualizar estado:', error);
     let statusCode = 500;
     let message = 'Error al asignar recruiter y actualizar el estado de la solicitud';
     
     if (error.message === 'Persona no encontrada') {
       statusCode = 404;
       message = error.message;
     } else if (error.message === 'La persona no tiene una solicitud asociada') {
       statusCode = 400;
       message = error.message;
     } else if (error.message === 'Usuario no encontrado o no es un recruiter') {
       statusCode = 400;
       message = error.message;
     }
     
     res.status(statusCode).json({ 
       message, 
       error: error.message 
     });
   }
 },

 // Dar observaciones a una persona
  giveObservations: async (req, res) => {
    try {
      const { personId, observations } = req.body;

      if (!personId || !observations) {
        return res.status(400).json({
          message: 'personId y observations son requeridos'
        });
      }

      const result = await RequestService.giveObservations(personId, observations);
      res.status(200).json(result);
    } catch (error) {
      if (error.message === 'Persona no encontrada') {
        return res.status(404).json({ message: error.message });
      }
      res.status(500).json({ message: 'Error interno del servidor', error: error.message });
     }
   },

  // Actualizar solo el status de una persona
  updatePersonStatus: async (req, res) => {
    try {
      const { personId, status } = req.body;

      if (!personId || isNaN(personId)) {
        return res.status(400).json({
          message: 'ID de persona inválido'
        });
      }

      if (!status) {
        return res.status(400).json({
          message: 'El estado es requerido'
        });
      }

      const result = await RequestService.updatePersonStatus(parseInt(personId), status);
      res.status(200).json(result);
    } catch (error) {
      console.error('Error al actualizar estado de persona:', error);
      const statusCode = error.message === 'Persona no encontrada' ? 404 : 500;
      res.status(statusCode).json({ 
        message: error.message === 'Persona no encontrada' ? error.message : 'Error al actualizar el estado', 
        error: error.message 
      });
    }
  },

  /**
   * Elimina una solicitud completa
   * Solo permite eliminar solicitudes en estado PENDING
   */
  deleteRequest: async (req, res) => {
    try {
      const { requestId } = req.params;

      // Validar que requestId sea un número
      if (!requestId || isNaN(parseInt(requestId))) {
        return res.status(400).json({
          message: 'ID de solicitud inválido'
        });
      }

      const result = await RequestService.deleteRequest(parseInt(requestId));
      res.status(200).json(result);
    } catch (error) {
      console.error('Error al eliminar solicitud:', error);
      
      // Manejar diferentes tipos de errores
      let statusCode = 500;
      let message = 'Error al eliminar la solicitud';
      
      if (error.message === 'Solicitud no encontrada') {
        statusCode = 404;
        message = error.message;
      } else if (error.message.includes('Solo se pueden eliminar solicitudes en estado PENDING')) {
        statusCode = 400;
        message = error.message;
      }
      
      res.status(statusCode).json({ 
        message, 
        error: error.message 
      });
    }
  }
};

module.exports = RequestController;