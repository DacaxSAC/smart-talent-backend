'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Agregar los campos faltantes a la tabla profile_ups
    await queryInterface.addColumn('profile_ups', 'requested_by', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    
    await queryInterface.addColumn('profile_ups', 'position_nature', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    
    await queryInterface.addColumn('profile_ups', 'required_personnel_type', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    
    await queryInterface.addColumn('profile_ups', 'call_type', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remover los campos agregados
    await queryInterface.removeColumn('profile_ups', 'requested_by');
    await queryInterface.removeColumn('profile_ups', 'position_nature');
    await queryInterface.removeColumn('profile_ups', 'required_personnel_type');
    await queryInterface.removeColumn('profile_ups', 'call_type');
  }
};