const express = require('express');
const router = express.Router();
const { UserController } = require('../controllers/user.controller');
const { authMiddleware, roleMiddleware } = require('../middleware/auth.middleware');
const { userValidation } = require('../middleware/validation.middleware');

/**
 * @swagger
 * tags:
 *   name: Usuarios
 *   description: Endpoints para la gestión de usuarios
 */

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Crear un nuevo usuario (solo Admin)
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 description: Nombre de usuario único
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Correo electrónico del usuario
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Contraseña del usuario
 *               roles:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Lista de nombres de roles a asignar (ej. ["ADMIN", "MANAGER"])
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Usuario creado exitosamente"
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     username:
 *                       type: string
 *                     email:
 *                       type: string
 *                     firstName:
 *                       type: string
 *                     lastName:
 *                       type: string
 *                     roles:
 *                       type: array
 *                       items:
 *                         type: string
 *       400:
 *         description: Datos inválidos o el usuario/correo ya existe
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado (requiere rol ADMIN)
 *       500:
 *         description: Error del servidor
 */
// Ruta para crear un nuevo usuario (solo admin)
router.post('/', [
  authMiddleware,
  roleMiddleware(['ADMIN']),
  userValidation.create
], UserController.create);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Obtener todos los usuarios (Admin, Manager)
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuarios obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   username:
 *                     type: string
 *                   email:
 *                     type: string
 *                   roles:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                         description:
 *                           type: string
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado (requiere rol ADMIN o MANAGER)
 *       500:
 *         description: Error del servidor
 */
// Ruta para obtener todos los usuarios (admin y manager)
router.get('/', [
  authMiddleware,
  roleMiddleware(['ADMIN', 'MANAGER'])
], UserController.getAll);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Obtener un usuario por ID (Admin, Manager)
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario a obtener
 *     responses:
 *       200:
 *         description: Usuario encontrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 username:
 *                   type: string
 *                 email:
 *                   type: string
 *                 roles:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado (requiere rol ADMIN o MANAGER)
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error del servidor
 */
// Ruta para obtener un usuario por ID
router.get('/:id', [
  authMiddleware,
  roleMiddleware(['ADMIN', 'MANAGER'])
], UserController.getById);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Actualizar un usuario (solo Admin)
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               roles:
 *                 type: array
 *                 items:
 *                   type: string
 *                   description: Nueva lista de nombres de roles a asignar (ej. ["USER"])
 *     responses:
 *       200:
 *         description: Usuario actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Usuario actualizado exitosamente"
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     username:
 *                       type: string
 *                     email:
 *                       type: string
 *                     roles:
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
 *         description: Usuario no encontrado
 *       500:
 *         description: Error del servidor
 */
// Ruta para actualizar un usuario
router.put('/:id', [
  authMiddleware,
  roleMiddleware(['ADMIN']),
  userValidation.update
], UserController.update);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Eliminar un usuario (solo Admin)
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario a eliminar
 *     responses:
 *       200:
 *         description: Usuario eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Usuario eliminado exitosamente"
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado (requiere rol ADMIN)
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error del servidor
 */
// Ruta para eliminar un usuario
router.delete('/:id', [
  authMiddleware,
  roleMiddleware(['ADMIN'])
], UserController.delete);

module.exports = { userRoutes: router };