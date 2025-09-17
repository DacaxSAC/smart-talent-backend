const { validationResult } = require('express-validator');
const RecruitmentService = require('../services/recruitment.service');

const RecruitmentController = {
  createRecruitmentWithProfile: async (req, res) => {
    try {
      // Validar entrada
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { recruitmentType, entityId, profileData } = req.body;

      // Validar que se proporcionen los datos requeridos
      if (!recruitmentType || !entityId || !profileData) {
        return res.status(400).json({
          message: 'Tipo de reclutamiento, ID de entidad y datos del perfil son requeridos'
        });
      }

      const result = await RecruitmentService.createRecruitmentWithProfile({
        recruitmentType,
        entityId,
        profileData,
        createdBy: req.user?.id // Asumiendo que el usuario está en req.user
      });

      res.status(201).json({
        message: 'Reclutamiento y perfil creados exitosamente',
        data: result
      });
    } catch (error) {
      console.error('Error al crear reclutamiento con perfil:', error);
      
      let statusCode = 500;
      let message = 'Error interno del servidor';
      
      if (error.message === 'Entidad no encontrada') {
        statusCode = 404;
        message = error.message;
      } else if (error.message.includes('requerido') || error.message.includes('válido')) {
        statusCode = 400;
        message = error.message;
      }
      
      res.status(statusCode).json({ 
        message,
        error: error.message 
      });
    }
  },

  getRecruitments: async (req, res) => {
    try {
      const { entityId, status } = req.query;
      const result = await RecruitmentService.getRecruitments({ entityId, status });
      
      res.status(200).json({
        message: 'Reclutamientos obtenidos exitosamente',
        data: result
      });
    } catch (error) {
      console.error('Error al obtener reclutamientos:', error);
      res.status(500).json({ 
        message: 'Error al obtener los reclutamientos',
        error: error.message 
      });
    }
  },

  getRecruitmentById: async (req, res) => {
    try {
      const { id } = req.params;
      const result = await RecruitmentService.getRecruitmentById(id);
      
      if (!result) {
        return res.status(404).json({
          message: 'Reclutamiento no encontrado'
        });
      }
      
      res.status(200).json({
        message: 'Reclutamiento obtenido exitosamente',
        data: result
      });
    } catch (error) {
      console.error('Error al obtener reclutamiento:', error);
      res.status(500).json({ 
        message: 'Error al obtener el reclutamiento',
        error: error.message 
      });
    }
  },

  updateRecruitmentStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      if (!status) {
        return res.status(400).json({
          message: 'El estado es requerido'
        });
      }
      
      const result = await RecruitmentService.updateRecruitmentStatus(id, status);
      
      res.status(200).json({
        message: 'Estado del reclutamiento actualizado exitosamente',
        data: result
      });
    } catch (error) {
      console.error('Error al actualizar estado del reclutamiento:', error);
      
      let statusCode = 500;
      let message = 'Error interno del servidor';
      
      if (error.message === 'Reclutamiento no encontrado') {
        statusCode = 404;
        message = error.message;
      }
      
      res.status(statusCode).json({ 
        message,
        error: error.message 
      });
    }
  }
};

module.exports = RecruitmentController;