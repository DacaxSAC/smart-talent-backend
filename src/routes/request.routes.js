const express = require('express');
const router = express.Router();
const RequestController = require('../controllers/request.controller');
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Personas obtenidas exitosamente"
 *                 people:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       dni:
 *                         type: string
 *                       fullname:
 *                         type: string
 *                       phone:
 *                         type: string
 *                       status:
 *                         type: string
 *                       observations:
 *                         type: string
 *                       Users:
                         type: array
                         description: Reclutadores asignados a esta persona
                         items:
                           type: object
                           properties:
                             id:
                               type: integer
                             username:
                               type: string
                             email:
                               type: string
                             Roles:
                               type: array
                               items:
                                 type: object
                                 properties:
                                   name:
                                     type: string
                                     example: "RECRUITER"
 *                       documents:
 *                         type: array
 *                         items:
 *                           type: object
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Personas obtenidas exitosamente"
 *                 people:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       dni:
 *                         type: string
 *                       fullname:
 *                         type: string
 *                       phone:
 *                         type: string
 *                       status:
 *                         type: string
 *                       observations:
 *                         type: string
 *                       owner:
 *                         type: string
 *                         description: Nombre del propietario de la entidad
 *                       Users:
                         type: array
                         description: Reclutadores asignados a esta persona
                         items:
                           type: object
                           properties:
                             id:
                               type: integer
                             username:
                               type: string
                             email:
                               type: string
                             Roles:
                               type: array
                               items:
                                 type: object
                                 properties:
                                   name:
                                     type: string
                                     example: "RECRUITER"
 *                       request:
 *                         type: object
 *                         properties:
 *                           entity:
 *                             type: object
 *                       documents:
 *                         type: array
 *                         items:
 *                           type: object
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
 * /requests/person/update-status:
 *   patch:
 *     summary: Actualizar solo el estado de una persona específica
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
 *               - personId
 *               - status
 *             properties:
 *               personId:
 *                 type: integer
 *                 description: ID de la persona
 *               status:
 *                 type: string
 *                 enum: [PENDING, IN_PROGRESS, OBSERVED, APPROVED, REJECTED]
 *                 description: Nuevo estado de la persona
 *     responses:
 *       200:
 *         description: Estado de persona actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 personId:
 *                   type: integer
 *                 newStatus:
 *                   type: string
 *                 personUpdated:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     fullname:
 *                       type: string
 *                     status:
 *                       type: string
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Persona no encontrada
 *       500:
 *         description: Error del servidor
 */
router.patch('/person/update-status', [
  authMiddleware,
  roleMiddleware(['USER', 'RECRUITER'])
], RequestController.updatePersonStatus);

/**
 * @swagger
 * /requests/assign-recruiter:
 *   patch:
 *     summary: Asignar un recruiter a una persona específica y cambiar estado de la solicitud a IN_PROGRESS
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
 *               - recruiterId
 *               - personId
 *             properties:
 *               recruiterId:
 *                 type: integer
 *                 description: ID del usuario recruiter a asignar
 *               personId:
 *                 type: integer
 *                 description: ID de la persona específica a asignar al recruiter
 *     responses:
 *       200:
 *         description: Recruiter asignado a la persona y estado actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 requestId:
 *                   type: integer
 *                 personId:
 *                   type: integer
 *                 recruiterId:
 *                   type: integer
 *                 recruiterName:
 *                   type: string
 *                 newStatus:
 *                   type: string
 *       400:
 *         description: Datos inválidos, usuario no es recruiter o persona sin solicitud asociada
 *       404:
 *         description: Persona no encontrada
 *       500:
 *         description: Error del servidor
 */
router.patch('/assign-recruiter', [
  authMiddleware,
  roleMiddleware(['RECRUITER'])
], RequestController.assignRecruiter);

/**
 * @swagger
 * /requests/give-observations:
 *   patch:
 *     summary: Agregar observaciones a una persona específica y cambiar estado a OBSERVED
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
 *               - personId
 *               - observations
 *             properties:
 *               personId:
 *                 type: integer
 *                 description: ID de la persona
 *               observations:
 *                 type: string
 *                 description: Observaciones a agregar a la persona específica
 *     responses:
 *       200:
 *         description: Observaciones agregadas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 personId:
 *                   type: integer
 *                 observations:
 *                   type: string
 *                 personUpdated:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     fullname:
 *                       type: string
 *                     observations:
 *                       type: string
 *                     status:
 *                       type: string
 *                 requestId:
 *                   type: integer
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Persona no encontrada
 *       500:
 *         description: Error del servidor
 */
router.patch('/give-observations', [
  authMiddleware,
  roleMiddleware(['RECRUITER'])
], RequestController.giveObservations);

module.exports = router;