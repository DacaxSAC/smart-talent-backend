const express = require('express');
const router = express.Router();
const { RoleController } = require('../controllers');
const { authMiddleware, roleMiddleware } = require('../middleware/auth.middleware');
const { roleValidation } = require('../middleware/validation.middleware');

/**
 * @swagger
 * tags:
 *   name: Roles
 *   description: Endpoints para la gestión de roles de usuario
 */

/**
 * @swagger
 * /api/roles:
 *   post:
 *     summary: Crear un nuevo rol (solo Admin)
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - permissions
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nombre del rol (ADMIN, USER, MANAGER, GUEST)
 *                 enum: [ADMIN, USER, MANAGER, GUEST]
 *               description:
 *                 type: string
 *                 description: Descripción del rol
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Lista de permisos asociados al rol
 *     responses:
 *       201:
 *         description: Rol creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Rol creado exitosamente"
 *                 role:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     description:
 *                       type: string
 *                     permissions:
 *                       type: array
 *                       items:
 *                         type: string
 *       400:
 *         description: Datos inválidos o el rol ya existe
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado (requiere rol ADMIN)
 *       500:
 *         description: Error del servidor
 */
// Ruta para crear un nuevo rol (solo admin)
router.post('/', [
  authMiddleware,
  roleMiddleware(['ADMIN']),
  roleValidation.create
], RoleController.create);

/**
 * @swagger
 * /api/roles:
 *   get:
 *     summary: Obtener todos los roles (Admin, Manager)
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de roles obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   name:
 *                     type: string
 *                   description:
 *                     type: string
 *                   permissions:
 *                     type: array
 *                     items:
 *                       type: string
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado (requiere rol ADMIN o MANAGER)
 *       500:
 *         description: Error del servidor
 */
// Ruta para obtener todos los roles
router.get('/', [
  authMiddleware,
  roleMiddleware(['ADMIN', 'MANAGER'])
], RoleController.getAll);

/**
 * @swagger
 * /api/roles/{id}:
 *   get:
 *     summary: Obtener un rol por ID (Admin, Manager)
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del rol a obtener
 *     responses:
 *       200:
 *         description: Rol encontrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 description:
 *                   type: string
 *                 permissions:
 *                   type: array
 *                   items:
 *                     type: string
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado (requiere rol ADMIN o MANAGER)
 *       404:
 *         description: Rol no encontrado
 *       500:
 *         description: Error del servidor
 */
// Ruta para obtener un rol por ID
router.get('/:id', [
  authMiddleware,
  roleMiddleware(['ADMIN', 'MANAGER'])
], RoleController.getById);

/**
 * @swagger
 * /api/roles/{id}:
 *   put:
 *     summary: Actualizar un rol (solo Admin)
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del rol a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - description
 *               - permissions
 *             properties:
 *               description:
 *                 type: string
 *                 description: Nueva descripción del rol
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Nueva lista de permisos asociados al rol
 *     responses:
 *       200:
 *         description: Rol actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Rol actualizado exitosamente"
 *                 role:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     description:
 *                       type: string
 *                     permissions:
 *                       type: array
 *                       items:
 *                         type: string
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado (requiere rol ADMIN)
 *       404:
 *         description: Rol no encontrado
 *       500:
 *         description: Error del servidor
 */
// Ruta para actualizar un rol
router.put('/:id', [
  authMiddleware,
  roleMiddleware(['ADMIN']),
  roleValidation.update
], RoleController.update);

/**
 * @swagger
 * /api/roles/{id}:
 *   delete:
 *     summary: Eliminar un rol (solo Admin)
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del rol a eliminar
 *     responses:
 *       200:
 *         description: Rol eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Rol eliminado exitosamente"
 *       400:
 *         description: No se puede eliminar un rol predeterminado del sistema
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado (requiere rol ADMIN)
 *       404:
 *         description: Rol no encontrado
 *       500:
 *         description: Error del servidor
 */
// Ruta para eliminar un rol
router.delete('/:id', [
  authMiddleware,
  roleMiddleware(['ADMIN'])
], RoleController.delete);

module.exports = { roleRoutes: router };