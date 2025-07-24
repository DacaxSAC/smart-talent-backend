const ResourceService = require('../services/resource.service');

const ResourceController = {
  // Actualizar múltiples recursos
  updateMultipleResources: async (req, res) => {
    try {
      const { resources } = req.body;

      if (!resources || !Array.isArray(resources) || resources.length === 0) {
        return res.status(400).json({
          message: 'Se requiere un array de recursos para actualizar'
        });
      }

      // Validar estructura de cada recurso
      for (const resource of resources) {
        if (!resource.resourceId || resource.value === undefined) {
          return res.status(400).json({
            message: 'Cada recurso debe tener resourceId y value'
          });
        }
      }

      const result = await ResourceService.updateMultipleResources(resources);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
  },

  // Obtener recurso por ID
  getById: async (req, res) => {
    try {
      const { id } = req.params;
      const resource = await ResourceService.getResourceById(id);
      res.status(200).json(resource);
    } catch (error) {
      if (error.message === 'Recurso no encontrado') {
        return res.status(404).json({ message: error.message });
      }
      res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
  },

  // Actualizar valor de un recurso específico
  updateValue: async (req, res) => {
    try {
      const { id } = req.params;
      const { value } = req.body;

      if (value === undefined) {
        return res.status(400).json({
          message: 'El campo value es requerido'
        });
      }

      const resource = await ResourceService.updateResourceValue(id, value);
      res.status(200).json({
        message: 'Recurso actualizado exitosamente',
        resource
      });
    } catch (error) {
      if (error.message === 'Recurso no encontrado') {
        return res.status(404).json({ message: error.message });
      }
      res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
  }
};

module.exports = ResourceController;