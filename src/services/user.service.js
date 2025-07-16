const { User, Role } = require('../models');
const { Op } = require('sequelize');

const UserService = {
  /**
   * Crea un nuevo usuario con roles específicos
   */
  async createUser(userData) {
    const { username, email, password, roles } = userData;

    // Verificar si el usuario ya existe
    const userExists = await User.findOne({
      where: {
        [Op.or]: [{ email: email }, { username: username }],
        active: true
      }
    });
    
    if (userExists) {
      throw new Error('El usuario o correo electrónico ya está registrado');
    }

    // Obtener roles
    let userRoles = [];
    if (roles && roles.length > 0) {
      const foundRoles = await Role.findAll({
        where: {
          name: {
            [Op.in]: roles
          }
        }
      });
      userRoles = foundRoles;
    } else {
      // Rol por defecto
      const defaultRole = await Role.findOne({ where: { name: 'USER' } });
      if (defaultRole) {
        userRoles = [defaultRole];
      }
    }

    // Crear usuario
    const user = await User.create({
      username,
      email,
      password,
    });

    // Asignar roles
    if (userRoles.length > 0) {
      await user.setRoles(userRoles);
    }

    // Obtener usuario con roles
    const userWithRoles = await User.findByPk(user.id, {
      include: [{
        model: Role,
        attributes: ['name', 'description'],
        through: { attributes: [] }
      }]
    });

    return {
      id: userWithRoles.id,
      username: userWithRoles.username,
      email: userWithRoles.email,
      roles: userWithRoles.Roles.map(role => role.name)
    };
  },

  /**
   * Obtiene todos los usuarios activos
   */
  async getAllUsers() {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      where: { active: true },
      include: [{
        model: Role,
        attributes: ['name', 'description'],
        through: { attributes: [] }
      }]
    });

    return users;
  },

  /**
   * Obtiene un usuario por ID
   */
  async getUserById(userId) {
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] },
      where: { active: true },
      include: [{
        model: Role,
        attributes: ['name', 'description'],
        through: { attributes: [] }
      }]
    });

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    return user;
  },

  /**
   * Actualiza un usuario
   */
  async updateUser(userId, updateData) {
    const { firstName, lastName, roles } = updateData;

    // Buscar usuario
    const user = await User.findOne({ 
      where: { id: userId, active: true } 
    });
    
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // Actualizar roles si se proporcionan
    if (roles && roles.length > 0) {
      const userRoles = await Role.findAll({
        where: {
          name: {
            [Op.in]: roles
          }
        }
      });
      await user.setRoles(userRoles);
    }

    // Actualizar datos básicos
    user.firstName = firstName !== undefined ? firstName : user.firstName;
    user.lastName = lastName !== undefined ? lastName : user.lastName;
    
    await user.save();

    // Obtener usuario actualizado con roles
    const userWithRoles = await User.findByPk(user.id, {
      include: [{
        model: Role,
        attributes: ['name', 'description'],
        through: { attributes: [] }
      }]
    });

    return {
      id: userWithRoles.id,
      username: userWithRoles.username,
      email: userWithRoles.email,
      firstName: userWithRoles.firstName,
      lastName: userWithRoles.lastName,
      roles: userWithRoles.Roles.map(role => role.name)
    };
  },

  /**
   * Desactiva un usuario (soft delete)
   */
  async deactivateUser(userId) {
    const user = await User.findOne({ 
      where: { id: userId, active: true } 
    });
    
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    user.active = false;
    await user.save();

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      active: user.active
    };
  }
};

module.exports = UserService;