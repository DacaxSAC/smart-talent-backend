const { DocumentType, ResourceType } = require('../models');
const DocumentTypeService = require('../services/documentType.service');

const DocumentTypeController = {
    getAllWithResources: async (req, res) => {
        try {
            const documentTypes = await DocumentTypeService.getAllDocumentTypesWithResources();
            res.status(200).json(documentTypes);
        } catch (error) {
            console.error('Error al obtener tipos de documento:', error);
            res.status(500).json({ message: error.message });
        }
    },
};

module.exports = { DocumentTypeController };