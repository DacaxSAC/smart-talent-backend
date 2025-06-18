const { DocumentType, ResourceType } = require('../models');

const DocumentTypeController = {
    getAllWithResources: async (req, res) => {
        try {
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

            res.status(200).json({
                message: 'Tipos de documentos obtenidos exitosamente',
                documentTypes
            });
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