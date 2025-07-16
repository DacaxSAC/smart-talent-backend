const { Role, User } = require('../models');

class RoleService {
  /**
   * Crear un nuevo rol
   */
  static async createRole(roleData) {
    const { name, description, permissions } = roleData;

    // Verificar si el rol ya existe
    const roleExists = await Role.findOne({ where: { name } });
    if (roleExists) {
      throw new Error('El rol ya existe');
    }

    // Crear nuevo rol
    const role = await Role.create({
      name,
      description,
      permissions
    });

    return role;
  }

  /**
   * Obtener todos los roles
   */
  static async getAllRoles() {
    return await Role.findAll();
  }

  /**
   * Obtener un rol por ID
   */
  static async getRoleById(id) {
    const role = await Role.findByPk(id);
    if (!role) {
      throw new Error('Rol no encontrado');
    }
    return role;
  }

  /**
   * Actualizar un rol
   */
  static async updateRole(id, updateData) {
    const { name, description, permissions } = updateData;

    const role = await Role.findByPk(id);
    if (!role) {
      throw new Error('Rol no encontrado');
    }

    // Verificar si es un rol predeterminado del sistema
    if (['ADMIN', 'MANAGER', 'USER'].includes(role.name)) {
      throw new Error('No se puede modificar un rol predeterminado del sistema');
    }

    // Verificar si el nuevo nombre ya existe (si se está cambiando)
    if (name && name !== role.name) {
      const existingRole = await Role.findOne({ where: { name } });
      if (existingRole) {
        throw new Error('Ya existe un rol con este nombre');
      }
    }

    // Actualizar campos
    role.name = name !== undefined ? name : role.name;
    role.description = description !== undefined ? description : role.description;
    role.permissions = permissions !== undefined ? permissions : role.permissions;

    await role.save();
    return role;
  }

  /**
   * Eliminar un rol
   */
  static async deleteRole(id) {
    const role = await Role.findByPk(id, {
      include: [{
        model: User,
        attributes: ['id'],
        through: { attributes: [] }
      }]
    });

    if (!role) {
      throw new Error('Rol no encontrado');
    }

    // Verificar si es un rol predeterminado del sistema
    if (['ADMIN', 'MANAGER', 'USER'].includes(role.name)) {
      throw new Error('No se puede eliminar un rol predeterminado del sistema');
    }

    // Verificar si hay usuarios con este rol
    if (role.Users && role.Users.length > 0) {
      throw new Error(`No se puede eliminar el rol porque hay ${role.Users.length} usuarios asignados a él`);
    }

    await role.destroy();
    return {
      id: role.id,
      name: role.name,
      message: 'Rol eliminado exitosamente'
    };
  }
}

module.exports = RoleService;