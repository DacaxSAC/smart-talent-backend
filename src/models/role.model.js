const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Role = sequelize.define('Role', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      // validate: {
      //   isIn: [['ADMIN', 'USER', 'MANAGER', 'GUEST']]
      // }
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false
    },
    permissions: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
      // validate: {
      //  isValidPermission(value) {
      //    if (!Array.isArray(value)) return;
      //    const validPermissions = ['CREATE', 'READ', 'UPDATE', 'DELETE'];
      //    for (const permission of value) {
      //      if (!validPermissions.includes(permission)) {
      //        throw new Error(`Permiso inválido: ${permission}`);
      //      }
      //    }
      //  }
      // }
    }
    ,
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    timestamps: true
  });

  return Role;
};