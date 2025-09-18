const { sequelize } = require('../config/database');

/**
 * Ejecuta una función dentro de una transacción de manera segura
 * @param {Function} callback - Función a ejecutar dentro de la transacción
 * @returns {Promise} Resultado de la función callback
 */
async function withTransaction(callback) {
  const transaction = await sequelize.transaction();
  
  try {
    const result = await callback(transaction);
    await transaction.commit();
    return result;
  } catch (error) {
    // Solo hacer rollback si la transacción no ha sido confirmada
    if (!transaction.finished) {
      await transaction.rollback();
    }
    throw error;
  }
}

/**
 * Verifica si una transacción puede ser revertida de manera segura
 * @param {Object} transaction - Objeto de transacción de Sequelize
 * @returns {boolean} True si se puede hacer rollback, false en caso contrario
 */
function canRollback(transaction) {
  return transaction && !transaction.finished;
}

module.exports = {
  withTransaction,
  canRollback
};