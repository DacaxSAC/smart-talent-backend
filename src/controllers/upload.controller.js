const admin = require('../config/firebase-admin');
const crypto = require('crypto');
const path = require('path');

const UploadController = {
  /**
   * Genera un nombre único para el archivo combinando timestamp, ID aleatorio y extensión original
   * @param {string} originalFileName - Nombre original del archivo
   * @returns {string} Nombre único del archivo
   */
  generateUniqueFileName: (originalFileName) => {
    // Obtener la extensión del archivo original
    const fileExtension = path.extname(originalFileName);
    
    // Obtener el nombre base sin extensión
    const baseName = path.basename(originalFileName, fileExtension);
    
    // Generar timestamp en formato YYYYMMDD_HHMMSS
    const now = new Date();
    const timestamp = now.toISOString()
      .replace(/[-:]/g, '')
      .replace('T', '_')
      .substring(0, 15); // YYYYMMDD_HHMMSS
    
    // Generar ID aleatorio corto (6 caracteres)
    const randomId = crypto.randomBytes(3).toString('hex');
    
    // Limpiar el nombre base (remover caracteres especiales y espacios)
    const cleanBaseName = baseName
      .replace(/[^a-zA-Z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '')
      .substring(0, 20); // Limitar longitud
    
    // Construir nombre único: baseName_timestamp_randomId.extension
    return `${cleanBaseName}_${timestamp}_${randomId}${fileExtension}`;
  },

  getWriteSignedUrl: async (req, res) => {
    try {
      const { fileName, contentType } = req.body;
      
      if (!fileName || !contentType) {
        return res.status(400).json({
          message: 'Nombre del archivo y tipo de contenido son requeridos'
        });
      }

      // Generar nombre único para evitar conflictos
      const uniqueFileName = UploadController.generateUniqueFileName(fileName);

      const bucket = admin.storage().bucket();
      const file = bucket.file(uniqueFileName);

      // Generar URL firmada para subida usando getSignedUrl en lugar de generateSignedUrl
      const [signedUrl] = await file.getSignedUrl({
        version: 'v4',
        action: 'write',
        expires: Date.now() + 15 * 60 * 1000, // URL válida por 15 minutos
        contentType: contentType
      });

      res.json({
        message: 'URL firmada generada exitosamente',
        signedUrl,
        fileName: uniqueFileName, // Devolver el nombre único generado
        originalFileName: fileName // Mantener referencia al nombre original
      });

    } catch (error) {
      console.error('Error al generar URL firmada:', error);
      res.status(500).json({
        message: 'Error al generar URL firmada',
        error: error.message
      });
    }
  },

  // Nuevo método para obtener URL firmada de lectura
  getReadSignedUrl: async (req, res) => {
    try {
      const { fileName } = req.body;

      if (!fileName) {
        return res.status(400).json({
          message: 'Nombre del archivo es requerido'
        });
      }

      const bucket = admin.storage().bucket();
      const file = bucket.file(fileName);

      // Generar URL firmada para lectura
      const [signedUrl] = await file.getSignedUrl({
        version: 'v4',
        action: 'read',
        expires: Date.now() + 15 * 60 * 1000 // URL válida por 15 minutos
      });

      res.json({
        message: 'URL firmada de lectura generada exitosamente',
        signedUrl,
        fileName
      });

    } catch (error) {
      console.error('Error al generar URL firmada de lectura:', error);
      res.status(500).json({
        message: 'Error al generar URL firmada de lectura',
        error: error.message
      });
    }
  }
};

module.exports = { UploadController };