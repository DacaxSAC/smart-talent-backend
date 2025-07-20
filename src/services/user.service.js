const { User, Role } = require('../models');
const { Op } = require('sequelize');
const PasswordGenerator = require('../utils/passwordGenerator');
const sendEmailCreateUser = require('./email.service');


const UserService = {
  async createUser(userData) {
    const { username, email, roleIds} = userData;

    // Verificar si el usuario ya existe
    const userExists = await User.findOne({
      where: {
        [Op.or]: [{ email: email }, { username: username }]
      }
    });
    if (userExists) {
      throw new Error('El usuario o correo electrónico ya está registrado');
    }

    // Generar contraseña si no se proporciona
    const userPassword = PasswordGenerator.generateSecure(12);
    // Crear el usuario
    const user = await User.create({
      username,
      email,
      password: userPassword,
      active: true
    });

    // Asignar roles si se proporcionan
    if (roleIds && roleIds.length > 0) {
      const roles = await Role.findAll({
        where: { id: roleIds }
      });
      await user.setRoles(roles);
    } else {
      // Asignar rol por defecto
      const defaultRole = await Role.findOne({ where: { name: 'USER' } });
      if (defaultRole) {
        await user.setRoles([defaultRole]);
      }
    }

    // Obtener el usuario con roles
    const userWithRoles = await User.findByPk(user.id, {
      attributes: { exclude: ['password'] },
      include: [{
        model: Role,
        attributes: ['id', 'name'],
        through: { attributes: [] }
      }]
    });

    await sendEmailCreateUser(user.email, userPassword);

    return {
      message: 'Usuario creado exitosamente',
      user: userWithRoles
    };
  },

  async getAllUsers() {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      include: [{
        model: Role,
        attributes: ['id', 'name'],
        through: { attributes: [] }
      }]
    });

    return {
      message: 'Usuarios obtenidos exitosamente',
      users
    };
  },

  async getUserById(id) {
    const user = await User.findByPk(id, {
      attributes: { exclude: ['password'] },
      include: [{
        model: Role,
        attributes: ['id', 'name'],
        through: { attributes: [] }
      }]
    });

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    return {
      message: 'Usuario obtenido exitosamente',
      user
    };
  },

  async updateUser(id, updateData) {
    const user = await User.findByPk(id);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // Verificar si el nuevo email o username ya existe en otro usuario
    if (updateData.email || updateData.username) {
      const whereConditions = [];
      if (updateData.email) {
        whereConditions.push({ email: updateData.email });
      }
      if (updateData.username) {
        whereConditions.push({ username: updateData.username });
      }

      const existingUser = await User.findOne({
        where: {
          [Op.and]: [
            { [Op.or]: whereConditions },
            { id: { [Op.ne]: id } }
          ]
        }
      });
      if (existingUser) {
        throw new Error('El usuario o correo electrónico ya está registrado');
      }
    }

    // Actualizar el usuario
    await User.update(updateData, {
      where: { id }
    });

    // Actualizar roles si se proporcionan
    if (updateData.roleIds) {
      const roles = await Role.findAll({
        where: { id: updateData.roleIds }
      });
      await user.setRoles(roles);
    }

    // Obtener el usuario actualizado
    const updatedUser = await User.findByPk(id, {
      attributes: { exclude: ['password'] },
      include: [{
        model: Role,
        attributes: ['id', 'name'],
        through: { attributes: [] }
      }]
    });

    return {
      message: 'Usuario actualizado exitosamente',
      user: updatedUser
    };
  },

  async deleteUser(id) {
    const user = await User.findByPk(id);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    await user.destroy();

    return {
      message: 'Usuario eliminado exitosamente'
    };
  }
};

module.exports = UserService;