const express = require('express');
const router = express.Router();
const { EntityController } = require('../controllers/entity.controller');
const { authMiddleware, roleMiddleware } = require('../middleware/auth.middleware');
const { entityValidation } = require('../middleware/validation.middleware');

/**
 * @swagger
 * /api/entities:
 *   post:
 *     summary: Crear una nueva entidad (Admin, Manager)
 *     tags: [Entities]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - documentNumber
 *               - email
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [NATURAL, JURIDICA]
 *                 description: Tipo de entidad
 *               documentNumber:
 *                 type: string
 *                 description: DNI (8 dígitos) o RUC (11 dígitos)
 *               firstName:
 *                 type: string
 *                 description: Nombres (requerido para tipo NATURAL)
 *               paternalSurname:
 *                 type: string
 *                 description: Apellido paterno (requerido para tipo NATURAL)
 *               maternalSurname:
 *                 type: string
 *                 description: Apellido materno (requerido para tipo NATURAL)
 *               businessName:
 *                 type: string
 *                 description: Razón social (requerido para tipo JURIDICA)
 *               address:
 *                 type: string
 *                 description: Dirección de la entidad
 *               phone:
 *                 type: string
 *                 description: Teléfono de la entidad
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Correo electrónico de la entidad
 *     responses:
 *       201:
 *         description: Entidad creada exitosamente
 *       400:
 *         description: Datos inválidos o entidad ya existe
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado (requiere rol ADMIN o MANAGER)
 *       500:
 *         description: Error del servidor
 */
router.post('/', [
    authMiddleware,
    roleMiddleware(['ADMIN', 'MANAGER']),
    entityValidation.create
  ],
  EntityController.create
);

/**
 * @swagger
 * /api/entities:
 *   get:
 *     summary: Obtener todas las entidades (Admin, Manager)
 *     tags: [Entities]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de entidades
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   type:
 *                     type: string
 *                     enum: [NATURAL, JURIDICA]
 *                   documentNumber:
 *                     type: string
 *                   firstName:
 *                     type: string
 *                   paternalSurname:
 *                     type: string
 *                   maternalSurname:
 *                     type: string
 *                   address:
 *                     type: string
 *                   phone:
 *                     type: string
 *                   businessName:
 *                     type: string
 *                   active:
 *                     type: boolean
 *                   requests:
 *                     type: array
 *                     items:
 *                       type: object
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado (requiere rol ADMIN o MANAGER)
 *       500:
 *         description: Error del servidor
 */
router.get('/', [
    authMiddleware,
    roleMiddleware(['ADMIN', 'MANAGER'])
  ],
  EntityController.getAll
);

/**
 * @swagger
 * /api/entities/{id}:
 *   get:
 *     summary: Obtener una entidad por ID (Admin, Manager)
 *     tags: [Entities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la entidad
 *     responses:
 *       200:
 *         description: Entidad encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 type:
 *                   type: string
 *                   enum: [NATURAL, JURIDICA]
 *                 documentNumber:
 *                   type: string
 *                 firstName:
 *                   type: string
 *                 paternalSurname:
 *                   type: string
 *                 maternalSurname:
 *                   type: string
 *                 address:
 *                   type: string
 *                 phone:
 *                   type: string
 *                 businessName:
 *                   type: string
 *                 active:
 *                   type: boolean
 *                 requests:
 *                   type: array
 *                   items:
 *                     type: object
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado (requiere rol ADMIN o MANAGER)
 *       404:
 *         description: Entidad no encontrada
 *       500:
 *         description: Error del servidor
 */
router.get('/:id', [
    authMiddleware,
    roleMiddleware(['ADMIN', 'MANAGER'])
  ],
  EntityController.getById
);

/**
 * @swagger
 * /api/entities/{id}:
 *   put:
 *     summary: Actualizar una entidad (Admin, Manager)
 *     tags: [Entities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la entidad
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [NATURAL, JURIDICA]
 *               documentNumber:
 *                 type: string
 *               firstName:
 *                 type: string
 *               paternalSurname:
 *                 type: string
 *               maternalSurname:
 *                 type: string
 *               address:
 *                 type: string
 *               phone:
 *                 type: string
 *               businessName:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Entidad actualizada exitosamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado (requiere rol ADMIN o MANAGER)
 *       404:
 *         description: Entidad no encontrada
 *       500:
 *         description: Error del servidor
 */
router.put('/:id', [
    authMiddleware,
    roleMiddleware(['ADMIN', 'MANAGER']),
    entityValidation.update
  ],
  EntityController.update
);

/**
 * @swagger
 * /api/entities/{id}:
 *   delete:
 *     summary: Eliminar una entidad (Admin, Manager)
 *     tags: [Entities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la entidad
 *     responses:
 *       200:
 *         description: Entidad eliminada exitosamente
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado (requiere rol ADMIN o MANAGER)
 *       404:
 *         description: Entidad no encontrada
 *       500:
 *         description: Error del servidor
 */
router.delete('/:id', [
    authMiddleware,
    roleMiddleware(['ADMIN', 'MANAGER'])
  ],
  EntityController.delete
);

module.exports = { entityRoutes: router};