const { DocumentType, ResourceType } = require('../models');

const DocumentTypeService = {
  async getAllWithResources() {
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

    return {
      message: 'Tipos de documentos obtenidos exitosamente',
      documentTypes
    };
  }
};

module.exports = DocumentTypeService;