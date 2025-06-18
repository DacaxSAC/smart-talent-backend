const express = require('express');
const router = express.Router();
const { RequestController } = require('../controllers/request.controller');
const { authMiddleware, roleMiddleware } = require('../middleware/auth.middleware');

/**
 * @swagger
 * /api/requests:
 *   post:
 *     summary: Crear una nueva solicitud con personas, documentos y recursos
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - entityId
 *               - people
 *             properties:
 *               entityId:
 *                 type: integer
 *                 description: ID de la entidad que realiza la solicitud
 *               people:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - fullname
 *                     - documentNumber
 *                     - documents
 *                   properties:
 *                     dni:
 *                       type: string
 *                       description: Número de DNI
 *                     fullname:
 *                       type: string
 *                       description: Nombres de la persona
 *                     phone:
 *                       type: string
 *                       description: Número de teléfono
 *                     documents:
 *                       type: array
 *                       items:
 *                         type: object
 *                         required:
 *                           - type
 *                           - number
 *                           - resources
 *                         properties:
 *                           documentTypeId:
 *                             type: number
 *                             description: ID del tipo de documento
 *                           name:
 *                             type: string
 *                             description: Nombre de documento
 *                           resources:
 *                             type: array
 *                             items:
 *                               type: object
 *                               required:
 *                                 - resourceTypeId
 *                                 - name
 *                                 - value
 *                               properties:
 *                                 resourceTypeId:
 *                                   type: number
 *                                   description: ID del tipo de recurso
 *                                 name:
 *                                   type: string
 *                                   description: Nombre del recurso
 *                                 value:
 *                                   type: string
 *                                   description: Valor del recurso
 *     responses:
 *       201:
 *         description: Solicitud creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Solicitud creada exitosamente"
 *                 request:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     entityId:
 *                       type: integer
 *                     status:
 *                       type: string
 *                     people:
 *                       type: array
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autenticado
 *       500:
 *         description: Error del servidor
 */
router.post('/', [
  authMiddleware,
  roleMiddleware(['ADMIN', 'USER'])
], RequestController.create);

/**
 * @swagger
 * /api/requests/entity/{entityId}/people:
 *   get:
 *     summary: Obtener todas las personas de una entidad específica
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: entityId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de personas obtenida exitosamente
 *       401:
 *         description: No autenticado
 *       404:
 *         description: Entidad no encontrada
 *       500:
 *         description: Error del servidor
 */
router.get('/entity/:entityId/people', [
  authMiddleware,
  roleMiddleware(['USER'])
], RequestController.getAllPersonsByEntityId);

/**
 * @swagger
 * /api/requests/people:
 *   get:
 *     summary: Obtener todas las personas con su entidad asociada
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de personas obtenida exitosamente
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.get('/people', [
  authMiddleware,
  roleMiddleware(['ADMIN', 'MANAGER'])
], RequestController.getAllPeople);

module.exports = { requestRoutes: router };