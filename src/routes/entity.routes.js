const express = require('express');
const router = express.Router();
const { EntityController } = require('../controllers/entity.controller');
const { authMiddleware, roleMiddleware } = require('../middleware/auth.middleware');
const { entityValidation } = require('../middleware/validation.middleware');

/**
 * @swagger
 * /entities:
 *   post:
 *     summary: Crear una nueva entidad con usuario asociado (Admin, Manager)
 *     description: Crea una entidad y automáticamente genera un usuario asociado con contraseña segura. Se envía un correo electrónico con las credenciales al usuario.
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
 *         description: Entidad y usuario creados exitosamente. Se envía correo con credenciales.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Entidad y usuario creados exitosamente"
 *                 entity:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     type:
 *                       type: string
 *                       enum: [NATURAL, JURIDICA]
 *                     documentNumber:
 *                       type: string
 *                     firstName:
 *                       type: string
 *                     paternalSurname:
 *                       type: string
 *                     maternalSurname:
 *                       type: string
 *                     businessName:
 *                       type: string
 *                     address:
 *                       type: string
 *                     phone:
 *                       type: string
 *                     active:
 *                       type: boolean
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     username:
 *                       type: string
 *                     email:
 *                       type: string
 *                     active:
 *                       type: boolean
 *                     entityId:
 *                       type: string
 *                     roles:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *       400:
 *         description: Datos inválidos, entidad ya existe, o usuario con email ya existe
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado (requiere rol ADMIN o MANAGER)
 *       500:
 *         description: Error del servidor
 */
router.post('/', [
    authMiddleware,
    roleMiddleware(['ADMIN']),
    entityValidation.create
  ],
  EntityController.create
);

/**
 * @swagger
 * /entities:
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
    roleMiddleware(['ADMIN'])
  ],
  EntityController.getAll
);

/**
 * @swagger
 * /entities/{id}:
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
    roleMiddleware(['ADMIN'])
  ],
  EntityController.getById
);

/**
 * @swagger
 * /entities/{id}:
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
    roleMiddleware(['ADMIN']),
    entityValidation.update
  ],
  EntityController.update
);

/**
 * @swagger
 * /entities/{id}:
 *   delete:
 *     summary: Eliminar una entidad (Soft Delete) (Admin, Manager)
 *     description: Realiza un soft delete de la entidad y su usuario asociado, cambiando el estado 'active' a false en lugar de eliminar físicamente los registros.
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
 *         description: Entidad eliminada exitosamente (soft delete)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Entidad eliminada exitosamente (soft delete)"
 *       400:
 *         description: La entidad ya está eliminada
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
    roleMiddleware(['ADMIN'])
  ],
  EntityController.delete
);

/**
 * @swagger
 * /entities/{id}/reactivate:
 *   put:
 *     summary: Reactivar una entidad y su usuario asociado (Admin, Manager)
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
 *         description: Entidad reactivada exitosamente
 *       400:
 *         description: La entidad ya está activa
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado (requiere rol ADMIN o MANAGER)
 *       404:
 *         description: Entidad no encontrada
 *       500:
 *         description: Error del servidor
 */
router.put('/:id/reactivate', [
    authMiddleware,
    roleMiddleware(['ADMIN'])
  ],
  EntityController.reactivate
);

/**
 * @swagger
 * /entities/{id}/users:
 *   post:
 *     summary: Agregar usuario adicional a entidad jurídica (Admin)
 *     description: Permite agregar un usuario adicional a una entidad de tipo JURIDICA. Solo las entidades jurídicas pueden tener múltiples usuarios.
 *     tags: [Entities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la entidad jurídica
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Correo electrónico del nuevo usuario
 *               username:
 *                 type: string
 *                 description: Nombre de usuario (opcional, se genera automáticamente si no se proporciona)
 *     responses:
 *       201:
 *         description: Usuario agregado exitosamente a la entidad
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Usuario agregado exitosamente a la entidad"
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     username:
 *                       type: string
 *                     email:
 *                       type: string
 *                     active:
 *                       type: boolean
 *                     entityId:
 *                       type: string
 *                     isPrimary:
 *                       type: boolean
 *                       example: false
 *                     roles:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *       400:
 *         description: Datos inválidos, entidad no es jurídica, o usuario con email ya existe
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado (requiere rol ADMIN)
 *       404:
 *         description: Entidad no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.post('/:id/users', [
    authMiddleware,
    roleMiddleware(['ADMIN'])
  ],
  EntityController.addUser
);

module.exports = router;