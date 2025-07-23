const express = require('express');
const router = express.Router();
const { RequestController } = require('../controllers/request.controller');
const { authMiddleware, roleMiddleware } = require('../middleware/auth.middleware');

/**
 * @swagger
 * /requests:
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
 * /requests/entity/{entityId}/people:
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
], RequestController.getPersonsByEntity);

/**
 * @swagger
 * /requests/people:
 *   get:
 *     summary: Obtener todas las personas con su entidad asociada
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           oneOf:
 *             - type: string
 *               enum: [PENDING, IN_PROGRESS, COMPLETED, REJECTED, OBSERVED]
 *             - type: array
 *               items:
 *                 type: string
 *                 enum: [PENDING, IN_PROGRESS, COMPLETED, REJECTED, OBSERVED]
 *         required: false
 *         description: Filtrar personas por estado (opcional). Puede ser un estado único o múltiples estados separados por comas
 *         example: "PENDING,IN_PROGRESS"
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
  roleMiddleware(['ADMIN', 'RECRUITER'])
], RequestController.getAllPeople);

/**
 * @swagger
 * /requests/{requestId}/status:
 *   patch:
 *     summary: Actualizar el estado de una solicitud
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la solicitud
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDING, IN_PROGRESS, COMPLETED, REJECTED, OBSERVED]
 *                 description: Nuevo estado de la solicitud
 *     responses:
 *       200:
 *         description: Estado de solicitud actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Estado de solicitud actualizado a IN_PROGRESS"
 *                 requestId:
 *                   type: integer
 *                 newStatus:
 *                   type: string
 *       400:
 *         description: ID de solicitud y estado son requeridos
 *       401:
 *         description: No autenticado
 *       404:
 *         description: Solicitud no encontrada
 *       500:
 *         description: Error del servidor
 */
router.patch('/:requestId/status', [
  authMiddleware,
  roleMiddleware(['ADMIN', 'RECRUITER'])
], RequestController.updateStatus);

/**
 * @swagger
 * /requests/{requestId}/assign-recruiter:
 *   patch:
 *     summary: Asignar un recruiter a una solicitud y cambiar estado a IN_PROGRESS
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la solicitud
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - recruiterId
 *             properties:
 *               recruiterId:
 *                 type: integer
 *                 description: ID del usuario recruiter a asignar
 *     responses:
 *       200:
 *         description: Recruiter asignado y estado actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 requestId:
 *                   type: integer
 *                 recruiterId:
 *                   type: integer
 *                 recruiterName:
 *                   type: string
 *                 newStatus:
 *                   type: string
 *       400:
 *         description: Datos inválidos o usuario no es recruiter
 *       404:
 *         description: Solicitud no encontrada
 *       500:
 *         description: Error del servidor
 */
router.patch('/:requestId/assign-recruiter', [
  authMiddleware,
  roleMiddleware(['ADMIN', 'RECRUITER'])
], RequestController.assignRecruiter);

module.exports = router;