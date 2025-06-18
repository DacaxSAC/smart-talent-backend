const { Document } = require('../models');

const DocumentController = {
  // ... existing code ...
// WARNING: Falta trasaction
  updateMultiple: async (req, res) => {
    try {
      const { updates } = req.body; // [{ id, result, filename }, ...]

      if (!Array.isArray(updates) || updates.length === 0) {
        return res.status(400).json({ message: 'Se requiere un array de actualizaciones.' });
      }

      const results = [];
      for (const update of updates) {
        const { id, result, filename } = update;
        const document = await Document.findByPk(id);
        if (!document) {
          results.push({ id, status: 'not found' });
          continue;
        }
        if (result !== undefined) document.result = result;
        if (filename !== undefined) {
          document.filename = filename;
          document.status = 'Realizado'
        }
        await document.save();
        results.push({ id, status: 'updated' });
      }

      res.status(200).json({
        message: 'Actualización masiva completada',
        results
      });
    } catch (error) {
      console.error('Error al actualizar documentos:', error);
      res.status(500).json({ message: 'Error al actualizar documentos', error: error.message });
    }
  },

  // ... existing code ...
};

module.exports = { DocumentController };