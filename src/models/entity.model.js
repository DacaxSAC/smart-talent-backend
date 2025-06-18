const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Entity extends Model {
    static associate(models) {
      
    }
  }

  Entity.init({
    type: {
      type: DataTypes.ENUM('NATURAL', 'JURIDICA'),
      allowNull: false,
      validate: {
        notNull: {
          msg: 'El tipo de entidad es requerido'
        },
        isIn: {
          args: [['NATURAL', 'JURIDICA']],
          msg: 'El tipo de entidad debe ser NATURAL o JURIDICA'
        }
      }
    },
    documentNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isValidDocument(value) {
          if (this.type === 'NATURAL' && !/^\d{8}$/.test(value)) {
            throw new Error('El DNI debe tener 8 dígitos');
          }
          if (this.type === 'JURIDICA' && !/^\d{11}$/.test(value)) {
            throw new Error('El RUC debe tener 11 dígitos');
          }
        }
      }
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isValidForNatural() {
          if (this.type === 'NATURAL' && !this.firstName) {
            throw new Error('El nombre es requerido para personas naturales');
          }
        }
      }
    },
    maternalSurname: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isValidForNatural() {
          if (this.type === 'NATURAL' && !this.maternalSurname) {
            throw new Error('El apellido materno es requerido para personas naturales');
          }
        }
      }
    },
    paternalSurname: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isValidForNatural() {
          if (this.type === 'NATURAL' && !this.paternalSurname) {
            throw new Error('El apellido paterno es requerido para personas naturales');
          }
        }
      }
    },
    businessName: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isValidForJuridica() {
          if (this.type === 'JURIDICA' && !this.businessName) {
            throw new Error('La razón social es requerida para personas jurídicas');
          }
        }
      }
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: {
          args: [5, 255],
          msg: 'La dirección debe tener entre 5 y 255 caracteres'
        }
      }
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        is: {
          args: /^[0-9+\-\s()]{6,20}$/,
          msg: 'El número de teléfono no tiene un formato válido'
        }
      }
    }
  }, {
    sequelize,
    modelName: 'Entity'
  });

  return Entity;
};