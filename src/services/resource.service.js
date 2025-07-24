const { Resource } = require('../models');
const { sequelize } = require('../config/database');

const ResourceService = {
  async updateMultipleResources(updates) {
    const t = await sequelize.transaction();

    try {
      if (!Array.isArray(updates) || updates.length === 0) {
        throw new Error('Se requiere un array de actualizaciones.');
      }

      const results = [];
      
      for (const update of updates) {
        const { resourceId, value } = update;
        
        if (!resourceId || value === undefined) {
          results.push({ resourceId, status: 'invalid data' });
          continue;
        }
        
        const resource = await Resource.findByPk(resourceId, { transaction: t });
        if (!resource) {
          results.push({ resourceId, status: 'not found' });
          continue;
        }
        
        resource.value = value;
        await resource.save({ transaction: t });
        results.push({ resourceId, status: 'updated' });
      }

      await t.commit();

      return {
        message: 'Actualización masiva de recursos completada',
        results
      };
    } catch (error) {
      await t.rollback();
      throw error;
    }
  },

  async getResourceById(id) {
    const resource = await Resource.findByPk(id);
    if (!resource) {
      throw new Error('Recurso no encontrado');
    }
    return resource;
  },

  async updateResourceValue(id, value) {
    const resource = await Resource.findByPk(id);
    if (!resource) {
      throw new Error('Recurso no encontrado');
    }
    
    resource.value = value;
    await resource.save();
    
    return resource;
  }
};

module.exports = ResourceService;