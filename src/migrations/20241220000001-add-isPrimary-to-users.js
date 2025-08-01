'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Users', 'isPrimary', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false,
      comment: 'Indica si es el usuario principal de la entidad (especialmente para entidades jurídicas)'
    });

    // Actualizar usuarios existentes para marcar como primarios aquellos que son únicos por entidad
    await queryInterface.sequelize.query(`
      UPDATE "Users" 
      SET "isPrimary" = true 
      WHERE "entityId" IS NOT NULL
      AND "active" = true;
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Users', 'isPrimary');
  }
};