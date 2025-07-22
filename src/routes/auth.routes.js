const express = require('express');
const router = express.Router();
const { AuthController } = require('../controllers');
const { authMiddleware } = require('../middleware/auth.middleware');
const { authValidation } = require('../middleware/validation.middleware');

/**
 * @swagger
 * tags:
 *   name: Autenticación
 *   description: Endpoints para gestión de autenticación
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Iniciar sesión de usuario
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Correo electrónico del usuario
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Contraseña del usuario
 *           example:
 *             email: admin@smarttalent.com
 *             password: Admin@123
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: Token JWT para autenticación
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
 *       401:
 *         description: Credenciales inválidas
 *       500:
 *         description: Error del servidor
 */

// Ruta para inicio de sesión
router.post('/login', [
  authValidation.login
], AuthController.login);

/**
 * @swagger
 * /auth/profile:
 *   get:
 *     summary: Obtener perfil del usuario actual
 *     tags: [Autenticación]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil del usuario
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
 *                     type: string
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error del servidor
 */

// Ruta para obtener perfil del usuario actual
router.get('/profile', [
  authMiddleware
], AuthController.getProfile);

/**
 * @swagger
 * /auth/request-password-reset:
 *   post:
 *     summary: Solicitar restablecimiento de contraseña
 *     tags: [Autenticación]
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
 *                 description: Correo electrónico del usuario
 *           example:
 *             email: usuario@ejemplo.com
 *     responses:
 *       200:
 *         description: Correo de restablecimiento enviado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Se ha enviado un correo con las instrucciones para restablecer tu contraseña
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error del servidor
 */

// Ruta para solicitar restablecimiento de contraseña
router.post('/request-password-reset', [
  authValidation.requestPasswordReset
], AuthController.requestPasswordReset);

/**
 * @swagger
 * /auth/validate-reset-token/{token}:
 *   get:
 *     summary: Validar token de restablecimiento de contraseña
 *     tags: [Autenticación]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Token de restablecimiento
 *     responses:
 *       200:
 *         description: Resultado de la validación del token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 valid:
 *                   type: boolean
 *                   description: Indica si el token es válido
 *                 message:
 *                   type: string
 *                   description: Mensaje descriptivo del resultado
 *       500:
 *         description: Error del servidor
 */

// Ruta para validar token de restablecimiento
router.get('/validate-reset-token/:token', AuthController.validateResetToken);

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Restablecer contraseña
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - newPassword
 *             properties:
 *               token:
 *                 type: string
 *                 description: Token de restablecimiento
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 description: Nueva contraseña del usuario
 *           example:
 *             token: abc123def456ghi789
 *             newPassword: NuevaContraseña123
 *     responses:
 *       200:
 *         description: Contraseña restablecida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Contraseña restablecida exitosamente
 *       400:
 *         description: Token inválido o expirado
 *       500:
 *         description: Error del servidor
 */

// Ruta para restablecer contraseña
router.post('/reset-password', [
  authValidation.resetPassword
], AuthController.resetPassword);

module.exports = router;