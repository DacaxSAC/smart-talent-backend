const { Document } = require('../models');
const { sequelize } = require('../config/database');

const DocumentService = {
  async updateMultipleDocuments(updates) {
    const t = await sequelize.transaction();

    try {
      if (!Array.isArray(updates) || updates.length === 0) {
        throw new Error('Se requiere un array de actualizaciones.');
      }

      const results = [];
      
      for (const update of updates) {
        const { id, result, filename } = update;
        
        const document = await Document.findByPk(id, { transaction: t });
        if (!document) {
          results.push({ id, status: 'not found' });
          continue;
        }
        
        let hasChanges = false;
        
        // Solo actualizar si result tiene contenido real
        if (result !== undefined && result !== null && result.trim() !== '') {
          document.result = result;
          hasChanges = true;
        }
        
        // Solo actualizar si filename tiene contenido real
        if (filename !== undefined && filename !== null && filename.trim() !== '') {
          document.filename = filename;
          document.status = 'Realizado';
          hasChanges = true;
        }
        
        // Solo guardar si hubo cambios reales
        if (hasChanges) {
          await document.save({ transaction: t });
          results.push({ id, status: 'updated' });
        } else {
          results.push({ id, status: 'no changes' });
        }
      }

      await t.commit();

      return {
        message: 'Actualización masiva completada',
        results
      };
    } catch (error) {
      await t.rollback();
      throw error;
    }
  },

  async getDocumentById(id) {
    const document = await Document.findByPk(id);
    if (!document) {
      throw new Error('Documento no encontrado');
    }
    return document;
  },

  async updateDocumentStatus(id, status) {
    const document = await Document.findByPk(id);
    if (!document) {
      throw new Error('Documento no encontrado');
    }
    
    document.status = status;
    await document.save();
    
    return document;
  }
};

module.exports = DocumentService;