const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Document extends Model {
    static associate(models) {

    }
  }

  Document.init({
    documentTypeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'DocumentTypes',
        key: 'id'
      }
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    result: {
      type: DataTypes.STRING,
      allowNull: true
    },
    filename: {
      type: DataTypes.STRING,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('Pendiente', 'Realizado', 'Rechazado'),
      defaultValue: 'Pendiente'
    },
    semaforo: {
      type: DataTypes.ENUM('PENDING', 'CLEAR', 'WARNING', 'CRITICAL'),
      defaultValue: 'PENDING',
      comment: 'Estado del semáforo: PENDING (inicial), CLEAR (verde), WARNING (amarillo), CRITICAL (rojo)'
    },
    personId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Document'
  });

  return Document;
};