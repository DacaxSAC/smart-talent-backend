const { Entity, User, Role } = require('../models');
const { Op } = require('sequelize');

const EntityService = {
  async createEntityWithUser(data) {
    const {
      type,
      documentNumber,
      firstName,
      paternalSurname,
      maternalSurname,
      address,
      phone,
      businessName,
      email
    } = data;

    // Verificar si la entidad ya existe por documento
    const entityExists = await Entity.findOne({ where: { documentNumber } });
    if (entityExists) {
      throw new Error('Ya existe una entidad con este número de documento');
    }

    // Verificar si ya existe un usuario con ese email
    const userExists = await User.findOne({
      where: { email, active: true }
    });
    if (userExists) {
      throw new Error('Ya existe un usuario con este email');
    }

    // Crear nueva entidad
    const entity = await Entity.create({
      type,
      documentNumber,
      firstName,
      paternalSurname,
      maternalSurname,
      businessName,
      address,
      phone,
      active: true
    });

    // Obtener el rol USER
    const userRole = await Role.findOne({ where: { name: 'USER' } });
    if (!userRole) {
      throw new Error('Error al asignar rol: Rol USER no encontrado');
    }

    // Crear usuario asociado
    const user = await User.create({
      username: type === 'NATURAL'
        ? `${firstName} ${paternalSurname} ${maternalSurname}`
        : businessName,
      email,
      password: documentNumber, // La contraseña será el DNI o RUC
      active: true,
      entityId: entity.id
    });

    // Asignar rol al usuario
    await user.setRoles([userRole]);

    return {
      entity,
      user: {
        email: user.email,
        username: user.username
      }
    };
  },

  async getAllEntities() {
    return await Entity.findAll({
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'email'],
        include: [{
          model: Role,
          attributes: ['name'],
          through: { attributes: [] }
        }]
      }]
    });
  },

  async getEntityById(id) {
    const entity = await Entity.findByPk(id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'email'],
        include: [{
          model: Role,
          attributes: ['name'],
          through: { attributes: [] }
        }]
      }]
    });

    if (!entity) {
      throw new Error('Entidad no encontrada');
    }

    return entity;
  },

  async updateEntity(id, updateData) {
    const entity = await Entity.findByPk(id);
    if (!entity) {
      throw new Error('Entidad no encontrada');
    }

    // Verificar si el documento ya existe en otra entidad
    if (updateData.documentNumber) {
      const existingEntity = await Entity.findOne({
        where: {
          documentNumber: updateData.documentNumber,
          id: { [Op.ne]: id }
        }
      });
      if (existingEntity) {
        throw new Error('Ya existe una entidad con este número de documento');
      }
    }

    // Actualizar la entidad
    await Entity.update(updateData, {
      where: { id }
    });

    // Obtener la entidad actualizada
    const updatedEntity = await Entity.findByPk(id);

    // Si se proporciona email, actualizar el usuario asociado
    if (updateData.email && entity.userId) {
      const user = await User.findByPk(entity.userId);
      if (user) {
        user.email = updateData.email;
        user.username = updateData.type === 'NATURAL' 
          ? `${updateData.firstName || entity.firstName} ${updateData.paternalSurname || entity.paternalSurname} ${updateData.maternalSurname || entity.maternalSurname}`
          : updateData.businessName || entity.businessName;
        await user.save();
      }
    }

    return updatedEntity;
  },

  async deleteEntity(id) {
    const entity = await Entity.findByPk(id);
    if (!entity) {
      throw new Error('Entidad no encontrada');
    }

    await entity.destroy();
    return { message: 'Entidad eliminada exitosamente' };
  }
};

module.exports = EntityService;