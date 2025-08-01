const { Model, DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
  class User extends Model {
    static associate(models) {
      // Define las asociaciones aquí si es necesario
      User.belongsToMany(models.Role, { through: 'UserRoles' });
      User.belongsTo(models.Entity, {
        foreignKey: 'entityId',
        as: 'entity'
      });
    }

    // Método para comparar contraseñas
    async comparePassword(candidatePassword) {
      try {
        return await bcrypt.compare(candidatePassword, this.password);
      } catch (error) {
        throw new Error('Error al comparar contraseñas');
      }
    }
  }

  User.init({
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    entityId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Entities',
        key: 'id'
      }
    },
    isPrimary: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Indica si es el usuario principal de la entidad (especialmente para entidades jurídicas)'
    },
    resetPasswordToken: {
      type: DataTypes.STRING,
      allowNull: true
    },
    resetPasswordExpires: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'User',
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      }
    }
  });

  return User;
};