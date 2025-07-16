const { DocumentType, ResourceType } = require('../models');

const DocumentTypeService = {
  /**
   * Obtiene todos los tipos de documentos activos con sus tipos de recursos
   */
  async getAllDocumentTypesWithResources() {
    const documentTypes = await DocumentType.findAll({
      where: { isActive: true },
      include: [{
        model: ResourceType,
        as: 'resourceTypes',
        through: { attributes: [] },
        attributes: ['id', 'name', 'isRequired', 'maxFileSize', 'allowedFileTypes']
      }],
      attributes: ['id', 'name', 'isActive']
    });

    return documentTypes;
  },

  /**
   * Obtiene un tipo de documento por ID
   */
  async getDocumentTypeById(documentTypeId) {
    const documentType = await DocumentType.findByPk(documentTypeId, {
      include: [{
        model: ResourceType,
        as: 'resourceTypes',
        through: { attributes: [] },
        attributes: ['id', 'name', 'isRequired', 'maxFileSize', 'allowedFileTypes']
      }]
    });

    if (!documentType) {
      throw new Error('Tipo de documento no encontrado');
    }

    return documentType;
  },

  /**
   * Crea un nuevo tipo de documento
   */
  async createDocumentType(documentTypeData) {
    const { name, isActive = true, resourceTypeIds = [] } = documentTypeData;

    const documentType = await DocumentType.create({
      name,
      isActive
    });

    // Asociar tipos de recursos si se proporcionan
    if (resourceTypeIds.length > 0) {
      const resourceTypes = await ResourceType.findAll({
        where: { id: resourceTypeIds }
      });
      await documentType.setResourceTypes(resourceTypes);
    }

    // Retornar con las asociaciones
    return await this.getDocumentTypeById(documentType.id);
  },

  /**
   * Actualiza un tipo de documento
   */
  async updateDocumentType(documentTypeId, updateData) {
    const { name, isActive, resourceTypeIds } = updateData;

    const documentType = await DocumentType.findByPk(documentTypeId);
    if (!documentType) {
      throw new Error('Tipo de documento no encontrado');
    }

    // Actualizar campos básicos
    if (name !== undefined) documentType.name = name;
    if (isActive !== undefined) documentType.isActive = isActive;
    
    await documentType.save();

    // Actualizar asociaciones de tipos de recursos si se proporcionan
    if (resourceTypeIds !== undefined) {
      const resourceTypes = await ResourceType.findAll({
        where: { id: resourceTypeIds }
      });
      await documentType.setResourceTypes(resourceTypes);
    }

    // Retornar con las asociaciones actualizadas
    return await this.getDocumentTypeById(documentType.id);
  },

  /**
   * Elimina (desactiva) un tipo de documento
   */
  async deleteDocumentType(documentTypeId) {
    const documentType = await DocumentType.findByPk(documentTypeId);
    if (!documentType) {
      throw new Error('Tipo de documento no encontrado');
    }

    documentType.isActive = false;
    await documentType.save();

    return documentType;
  }
};

module.exports = DocumentTypeService;