const { Document, Person } = require('../models');
const { sequelize } = require('../config/database');

const DocumentService = {
  async updateMultipleDocuments(updates) {
    const t = await sequelize.transaction();

    try {
      if (!Array.isArray(updates) || updates.length === 0) {
        throw new Error('Se requiere un array de actualizaciones.');
      }

      const results = [];
      const personsToCheck = new Set(); // Para rastrear qué personas verificar
      
      for (const update of updates) {
        const { id, result, filename, semaforo } = update;
        
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
          // Agregar la persona a la lista de verificación
          personsToCheck.add(document.personId);
        }
        
        // Actualizar semáforo si se proporciona
        if (semaforo !== undefined && ['PENDING', 'CLEAR', 'WARNING', 'CRITICAL'].includes(semaforo)) {
          document.semaforo = semaforo;
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

      // Verificar y actualizar el estado de las personas
      for (const personId of personsToCheck) {
        await this.checkAndUpdatePersonStatus(personId, t);
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

  async checkAndUpdatePersonStatus(personId, transaction) {
    // Obtener todos los documentos de la persona
    const documents = await Document.findAll({
      where: { personId },
      transaction
    });

    // Verificar si todos los documentos están realizados
    const allCompleted = documents.length > 0 && documents.every(doc => doc.status === 'Realizado');

    if (allCompleted) {
      // Actualizar el estado de la persona a COMPLETED
      await Person.update(
        { status: 'COMPLETED' },
        { 
          where: { id: personId },
          transaction
        }
      );
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
    const t = await sequelize.transaction();
    
    try {
      const document = await Document.findByPk(id, { transaction: t });
      if (!document) {
        throw new Error('Documento no encontrado');
      }
      
      document.status = status;
      await document.save({ transaction: t });
      
      // Si el documento se marca como 'Realizado', verificar el estado de la persona
      if (status === 'Realizado') {
        await this.checkAndUpdatePersonStatus(document.personId, t);
      }
      
      await t.commit();
      return document;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }
};

module.exports = DocumentService;