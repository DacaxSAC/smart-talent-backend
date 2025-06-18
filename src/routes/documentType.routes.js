const express = require('express');
const { DocumentTypeController } = require('../controllers/documentType.controller');
const router = express.Router();

/**
 * @swagger
 * /api/document-types-with-resource-types:
 *   get:
 *     tags:
 *       - Tipos de Documentos
 *     summary: Obtiene todos los tipos de documentos con sus recursos asociados
 *     description: Retorna una lista de todos los tipos de documentos activos junto con sus tipos de recursos asociados
 *     responses:
 *       200:
 *         description: Lista de tipos de documentos obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Tipos de documentos obtenidos exitosamente
 *                 documentTypes:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       name:
 *                         type: string
 *                         example: Antecedentes Penales
 *                       isActive:
 *                         type: boolean
 *                         example: true
 *                       resourceTypes:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: integer
 *                               example: 1
 *                             name:
 *                               type: string
 *                               example: DOCUMENTO_ORIGINAL
 *                             isRequired:
 *                               type: boolean
 *                               example: true
 *                             maxFileSize:
 *                               type: integer
 *                               example: 5000000
 *                             allowedFileTypes:
 *                               type: array
 *                               items:
 *                                 type: string
 *                               example: ["image/jpeg", "image/png", "application/pdf"]
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error al obtener tipos de documentos
 *                 error:
 *                   type: string
 */
router.get('/with-resource-types', DocumentTypeController.getAllWithResources);

module.exports = { documentTypeRoutes: router };