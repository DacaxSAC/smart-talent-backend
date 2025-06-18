const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Person extends Model {
    static associate(models) {
    }
  }

  Person.init({
    dni: {
      type: DataTypes.STRING,
      allowNull: false,
      // unique: true,
      validate: {
        notEmpty: true,
        len: [8, 12] 
      }
    },
    fullname: {
      type: DataTypes.STRING,
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        is: /^\+?[1-9]\d{1,14}$/ // Validación para formato internacional de teléfono
      }
    },
    requestId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED', 'REJECTED'),
      defaultValue: 'PENDING'
    },
  }, {
    sequelize,
    modelName: 'Person'
  });

  return Person;
};