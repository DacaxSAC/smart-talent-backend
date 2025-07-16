const { Document } = require('../models');
const { sequelize } = require('../config/database');

const DocumentService = {
  /**
   * Actualiza múltiples documentos en una transacción
   */
  async updateMultipleDocuments(updates) {
    if (!Array.isArray(updates) || updates.length === 0) {
      throw new Error('Se requiere un array de actualizaciones.');
    }

    const transaction = await sequelize.transaction();
    
    try {
      const results = [];
      
      for (const update of updates) {
        const { id, result, filename } = update;
        
        const document = await Document.findByPk(id, { transaction });
        
        if (!document) {
          results.push({ id, status: 'not found' });
          continue;
        }
        
        // Actualizar campos si se proporcionan
        if (result !== undefined) {
          document.result = result;
        }
        
        if (filename !== undefined) {
          document.filename = filename;
          document.status = 'Realizado';
        }
        
        await document.save({ transaction });
        results.push({ id, status: 'updated' });
      }
      
      await transaction.commit();
      return results;
      
    } catch (error) {
      await transaction.rollback();
      throw new Error(`Error al actualizar documentos: ${error.message}`);
    }
  },

  /**
   * Obtiene un documento por ID
   */
  async getDocumentById(documentId) {
    const document = await Document.findByPk(documentId);
    
    if (!document) {
      throw new Error('Documento no encontrado');
    }
    
    return document;
  },

  /**
   * Actualiza el estado de un documento
   */
  async updateDocumentStatus(documentId, status, result = null, filename = null) {
    const document = await Document.findByPk(documentId);
    
    if (!document) {
      throw new Error('Documento no encontrado');
    }
    
    document.status = status;
    
    if (result !== null) {
      document.result = result;
    }
    
    if (filename !== null) {
      document.filename = filename;
    }
    
    await document.save();
    return document;
  }
};

module.exports = DocumentService;