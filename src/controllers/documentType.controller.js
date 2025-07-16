const DocumentTypeService = require('../services/documentType.service');

const DocumentTypeController = {
    getAllWithResources: async (req, res) => {
        try {
            const result = await DocumentTypeService.getAllWithResources();
            res.status(200).json(result);
        } catch (error) {
            console.error('Error al obtener tipos de documentos:', error);
            res.status(500).json({ 
                message: 'Error al obtener tipos de documentos', 
                error: error.message 
            });
        }
    },
};

module.exports = { DocumentTypeController };