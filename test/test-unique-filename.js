/**
 * Script de prueba para demostrar la generación de nombres únicos de archivos
 * Este archivo puede ser eliminado después de verificar el funcionamiento
 */

const crypto = require('crypto');
const path = require('path');

/**
 * Genera un nombre único para el archivo combinando timestamp, ID aleatorio y extensión original
 * @param {string} originalFileName - Nombre original del archivo
 * @returns {string} Nombre único del archivo
 */
function generateUniqueFileName(originalFileName) {
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
}

// Ejemplos de prueba
console.log('🧪 Pruebas de generación de nombres únicos:\n');

const testFiles = [
  'documento.pdf',
  'Contrato de Trabajo.docx',
  'foto-perfil.jpg',
  'curriculum vitae.pdf',
  'certificado médico.png',
  'archivo con espacios y símbolos @#$.txt'
];

testFiles.forEach(fileName => {
  const uniqueName = generateUniqueFileName(fileName);
  console.log(`📄 Original: ${fileName}`);
  console.log(`✨ Único:    ${uniqueName}\n`);
});

console.log('🔍 Características del nombre único:');
console.log('• Incluye timestamp (YYYYMMDD_HHMMSS)');
console.log('• Incluye ID aleatorio de 6 caracteres');
console.log('• Mantiene la extensión original');
console.log('• Limpia caracteres especiales del nombre base');
console.log('• Limita la longitud del nombre base a 20 caracteres');
console.log('• Formato: nombreBase_timestamp_randomId.extension');