const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Request extends Model {
    static associate(models) {
      
    }
  }

  Request.init({
    entityId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED', 'REJECTED', 'OBSERVED'),
      defaultValue: 'PENDING',
      allowNull: false
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
  }, {
    sequelize,
    modelName: 'Request'
  });

  return Request;
};