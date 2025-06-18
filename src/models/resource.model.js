const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Resource extends Model {
    static associate(models) {

    }
  }

  Resource.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    value: {
      type: DataTypes.STRING,
      allowNull: false
    },
    documentId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    resourceTypeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'ResourceTypes',
        key: 'id'
      }
    },
  }, {
    sequelize,
    modelName: 'Resource'
  });

  return Resource;
};