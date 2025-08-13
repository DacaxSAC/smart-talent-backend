const express = require('express');
const router = express.Router();
const { DocumentController } = require('../controllers/document.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

/**
 * @swagger
 * /document/bulk-update:
 *   put:
 *     summary: Actualizar el resultado, nombre de archivo y semáforo de varios documentos
 *     tags: [Document]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - updates
 *             properties:
 *               updates:
 *                 type: array
 *                 description: Lista de documentos a actualizar
 *                 items:
 *                   type: object
 *                   required:
 *                     - id
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: ID del documento
 *                       example: 1
 *                     result:
 *                       type: string
 *                       description: Nuevo resultado del documento
 *                       example: "Aprobado"
 *                     filename:
 *                       type: string
 *                       description: Nuevo nombre de archivo
 *                       example: "documento_actualizado.pdf"
 *                     semaforo:
 *                       type: string
 *                       enum: ["PENDING", "CLEAR", "WARNING", "CRITICAL"]
 *                       description: Estado del semáforo del documento
 *                       example: "CLEAR"
 *     responses:
 *       200:
 *         description: Actualización masiva completada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Actualización masiva completada"
 *                 results:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       status:
 *                         type: string
 *                         example: "updated"
 *       400:
 *         description: Solicitud inválida
 *       401:
 *         description: No autenticado
 *       500:
 *         description: Error del servidor
 */
router.put('/bulk-update', authMiddleware, DocumentController.updateMultiple);

module.exports =  router;