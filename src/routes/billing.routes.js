const express = require('express');
const router = express.Router();
const { BillingController } = require('../controllers');
const { authMiddleware } = require('../middleware/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Facturación
 *   description: Endpoints para gestión de facturación y historial
 */

/**
 * @swagger
 * /billing/requests-history:
 *   post:
 *     summary: Obtener historial de solicitudes de facturación
 *     tags: [Facturación]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               dateFrom:
 *                 type: string
 *                 format: date
 *                 example: "2024-01-01"
 *               dateTo:
 *                 type: string
 *                 format: date
 *                 example: "2024-12-31"
 *               status:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: ["PENDING", "PAID", "CANCELLED"]
 *                 example: ["PAID", "PENDING"]
 *               minAmount:
 *                 type: number
 *                 example: 100
 *               maxAmount:
 *                 type: number
 *                 example: 1000
 *               entityId:
 *                 type: integer
 *                 example: 1
 *               page:
 *                 type: integer
 *                 minimum: 1
 *                 default: 1
 *                 example: 1
 *               limit:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 100
 *                 default: 10
 *                 example: 10
 *     responses:
 *       200:
 *         description: Historial de solicitudes obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Historial de solicitudes obtenido exitosamente"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       requestDate:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-01-15T10:30:00Z"
 *                       amount:
 *                         type: number
 *                         example: 150.50
 *                       status:
 *                         type: string
 *                         example: "PAID"
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.post('/requests-history', [
  authMiddleware
], BillingController.getRequestsHistory);

/**
 * @swagger
 * /billing/recruitments-history:
 *   post:
 *     summary: Obtener historial de reclutamientos
 *     tags: [Facturación]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               dateFrom:
 *                 type: string
 *                 format: date
 *                 example: "2024-01-01"
 *               dateTo:
 *                 type: string
 *                 format: date
 *                 example: "2024-12-31"
 *               status:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: ["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"]
 *                 example: ["COMPLETED", "IN_PROGRESS"]
 *               position:
 *                 type: string
 *                 example: "Desarrollador"
 *               candidateName:
 *                 type: string
 *                 example: "Juan"
 *               entityId:
 *                 type: integer
 *                 example: 1
 *               page:
 *                 type: integer
 *                 minimum: 1
 *                 default: 1
 *                 example: 1
 *               limit:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 100
 *                 default: 10
 *                 example: 10
 *     responses:
 *       200:
 *         description: Historial de reclutamientos obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Historial de reclutamientos obtenido exitosamente"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       recruitmentDate:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-01-15T10:30:00Z"
 *                       candidateName:
 *                         type: string
 *                         example: "Juan Pérez"
 *                       position:
 *                         type: string
 *                         example: "Desarrollador Frontend"
 *                       status:
 *                         type: string
 *                         example: "COMPLETED"
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.post('/recruitments-history', [
  authMiddleware
], BillingController.getRecruitmentsHistory);

module.exports = router;