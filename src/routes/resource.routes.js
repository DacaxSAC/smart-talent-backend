const express = require('express');
const router = express.Router();
const ResourceController = require('../controllers/resource.controller');
const { authMiddleware, roleMiddleware } = require('../middleware/auth.middleware');

/**
 * @swagger
 * /resources/update-multiple:
 *   patch:
 *     summary: Actualizar múltiples recursos de forma masiva
 *     tags: [Resources]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - resources
 *             properties:
 *               resources:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - resourceId
 *                     - value
 *                   properties:
 *                     resourceId:
 *                       type: integer
 *                       description: ID del recurso a actualizar
 *                     value:
 *                       type: string
 *                       description: Nuevo valor del recurso
 *           example:
 *             resources:
 *               - resourceId: 1
 *                 value: "nuevo valor 1"
 *               - resourceId: 2
 *                 value: "nuevo valor 2"
 *     responses:
 *       200:
 *         description: Recursos actualizados exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 results:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       resourceId:
 *                         type: integer
 *                       status:
 *                         type: string
 *                         enum: [updated, not found, invalid data]
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.patch('/update-multiple', [
  authMiddleware,
  roleMiddleware(['ADMIN', 'MANAGER', 'RECRUITER'])
], ResourceController.updateMultipleResources);

/**
 * @swagger
 * /resources/{id}:
 *   get:
 *     summary: Obtener un recurso por ID
 *     tags: [Resources]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del recurso
 *     responses:
 *       200:
 *         description: Recurso encontrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 value:
 *                   type: string
 *                 documentId:
 *                   type: integer
 *                 resourceTypeId:
 *                   type: integer
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Recurso no encontrado
 *       500:
 *         description: Error del servidor
 */
router.get('/:id', [
  authMiddleware,
  roleMiddleware(['ADMIN', 'MANAGER', 'RECRUITER'])
], ResourceController.getById);

/**
 * @swagger
 * /resources/{id}/value:
 *   patch:
 *     summary: Actualizar el valor de un recurso específico
 *     tags: [Resources]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del recurso
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - value
 *             properties:
 *               value:
 *                 type: string
 *                 description: Nuevo valor del recurso
 *     responses:
 *       200:
 *         description: Recurso actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 resource:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     value:
 *                       type: string
 *                     documentId:
 *                       type: integer
 *                     resourceTypeId:
 *                       type: integer
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Recurso no encontrado
 *       500:
 *         description: Error del servidor
 */
router.patch('/:id/value', [
  authMiddleware,
  roleMiddleware(['ADMIN', 'MANAGER', 'RECRUITER'])
], ResourceController.updateValue);

module.exports = router;