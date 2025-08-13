'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  /**
   * Agregar columna semaforo a la tabla Documents
   */
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Documents', 'semaforo', {
      type: Sequelize.ENUM('PENDING', 'CLEAR', 'WARNING', 'CRITICAL'),
      allowNull: false,
      defaultValue: 'PENDING',
      comment: 'Estado del semáforo del documento'
    });
  },

  /**
   * Remover columna semaforo de la tabla Documents
   */
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Documents', 'semaforo');
    // También eliminar el tipo ENUM si es necesario
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Documents_semaforo";');
  }
};