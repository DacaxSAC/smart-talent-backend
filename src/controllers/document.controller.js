const { Document } = require('../models');
const { validationResult } = require('express-validator');
const { sequelize } = require('../config/database');
const DocumentService = require('../services/document.service');

const DocumentController = {
  // ... existing code ...
// Actualizar múltiples documentos
  updateMultiple: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const updatedDocuments = await DocumentService.updateMultipleDocuments(req.body.documents);

      res.status(200).json({
        message: 'Documentos actualizados exitosamente',
        documents: updatedDocuments
      });
    } catch (error) {
      console.error('Error al actualizar documentos:', error);
      const statusCode = error.message.includes('no encontrado') ? 404 : 
                        error.message.includes('al menos un documento') ? 400 : 500;
      res.status(statusCode).json({ message: error.message });
    }
  },

  // ... existing code ...
};

module.exports = { DocumentController };