const { Role } = require('../models');

const RoleService = {
  async createRole(data) {
    const { name, description } = data;

    // Verificar si el rol ya existe
    const existingRole = await Role.findOne({ where: { name } });
    if (existingRole) {
      throw new Error('Ya existe un rol con este nombre');
    }

    const role = await Role.create({
      name,
      description
    });

    return {
      message: 'Rol creado exitosamente',
      role
    };
  },

  async getAllRoles() {
    const roles = await Role.findAll({
      attributes: ['id', 'name', 'description']
    });

    return {
      message: 'Roles obtenidos exitosamente',
      roles
    };
  },

  async getRoleById(id) {
    const role = await Role.findByPk(id, {
      attributes: ['id', 'name', 'description']
    });

    if (!role) {
      throw new Error('Rol no encontrado');
    }

    return {
      message: 'Rol obtenido exitosamente',
      role
    };
  },

  async updateRole(id, updateData) {
    const role = await Role.findByPk(id);
    if (!role) {
      throw new Error('Rol no encontrado');
    }

    // Verificar si el nuevo nombre ya existe en otro rol
    if (updateData.name) {
      const existingRole = await Role.findOne({
        where: {
          name: updateData.name,
          id: { [require('sequelize').Op.ne]: id }
        }
      });
      if (existingRole) {
        throw new Error('Ya existe un rol con este nombre');
      }
    }

    await Role.update(updateData, {
      where: { id }
    });

    const updatedRole = await Role.findByPk(id);

    return {
      message: 'Rol actualizado exitosamente',
      role: updatedRole
    };
  },

  async deleteRole(id) {
    const role = await Role.findByPk(id);
    if (!role) {
      throw new Error('Rol no encontrado');
    }

    await role.destroy();

    return {
      message: 'Rol eliminado exitosamente'
    };
  }
};

module.exports = RoleService;