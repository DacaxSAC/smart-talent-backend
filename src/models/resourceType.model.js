const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class ResourceType extends Model {
    static associate(models) {
    }
  }

  ResourceType.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    isRequired: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    maxFileSize: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    allowedFileTypes: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: ['image/jpeg', 'image/png', 'application/pdf']
    }
  }, {
    sequelize,
    modelName: 'ResourceType',
  })

  return ResourceType;
}