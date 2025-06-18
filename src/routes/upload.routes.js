const express = require('express');
const router = express.Router();
const { UploadController } = require('../controllers/upload.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

/**
 * @swagger
 * /api/upload/write-signed-url:
 *   post:
 *     summary: Generar URL firmada para subir archivos a Firebase Storage
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fileName
 *               - contentType
 *             properties:
 *               fileName:
 *                 type: string
 *                 description: Nombre del archivo a subir
 *                 example: "documento.pdf"
 *               contentType:
 *                 type: string
 *                 description: Tipo de contenido del archivo
 *                 example: "application/pdf"
 *     responses:
 *       200:
 *         description: URL firmada generada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "URL firmada generada exitosamente"
 *                 signedUrl:
 *                   type: string
 *                   description: URL firmada para subir el archivo
 *                   example: "https://storage.googleapis.com/..."
 *                 fileName:
 *                   type: string
 *                   description: Nombre del archivo
 *                   example: "documento.pdf"
 *       400:
 *         description: Datos inválidos en la solicitud
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.post('/write-signed-url', authMiddleware, UploadController.getWriteSignedUrl);

/**
 * @swagger
 * /api/upload/read-signed-url:
 *   post:
 *     summary: Generar URL firmada para leer (descargar) archivos de Firebase Storage
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fileName
 *             properties:
 *               fileName:
 *                 type: string
 *                 description: Nombre del archivo a descargar
 *                 example: "documento.pdf"
 *     responses:
 *       200:
 *         description: URL firmada de lectura generada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "URL firmada de lectura generada exitosamente"
 *                 signedUrl:
 *                   type: string
 *                   description: URL firmada para descargar el archivo
 *                   example: "https://storage.googleapis.com/..."
 *                 fileName:
 *                   type: string
 *                   description: Nombre del archivo
 *                   example: "documento.pdf"
 *       400:
 *         description: Datos inválidos en la solicitud
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.post('/read-signed-url', authMiddleware, UploadController.getReadSignedUrl);

module.exports = { uploadRoutes: router };