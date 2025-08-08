const { validationResult } = require('express-validator');
const BillingService = require('../services/billing.service');

const BillingController = {
  // Obtener historial de solicitudes de facturación
  getRequestsHistory: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: errors.array()
      });
    }

    try {
      const result = await BillingService.getRequestsHistory(req.body);
      
      return res.status(200).json({
        success: true,
        message: 'Historial de solicitudes obtenido exitosamente',
        data: result
      });

    } catch (error) {
      console.error('Error al obtener historial de solicitudes:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor al obtener historial de solicitudes',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Obtener historial de reclutamientos
  getRecruitmentsHistory: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: errors.array()
      });
    }

    try {
      const result = await BillingService.getRecruitmentsHistory(req.body);
      
      return res.status(200).json({
        success: true,
        message: 'Historial de reclutamientos obtenido exitosamente',
        data: result
      });

    } catch (error) {
      console.error('Error al obtener historial de reclutamientos:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor al obtener historial de reclutamientos',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },
};

module.exports = { BillingController };