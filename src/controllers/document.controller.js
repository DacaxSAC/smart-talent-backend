const DocumentService = require('../services/document.service');

const DocumentController = {
  updateMultiple: async (req, res) => {
    try {
      const { updates } = req.body;
      const result = await DocumentService.updateMultipleDocuments(updates);
      res.status(200).json(result);
    } catch (error) {
      console.error('Error al actualizar documentos:', error);
      const statusCode = error.message === 'Se requiere un array de actualizaciones.' ? 400 : 500;
      res.status(statusCode).json({ message: error.message });
    }
  }
};

module.exports = { DocumentController };