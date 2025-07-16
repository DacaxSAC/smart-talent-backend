const { Entity, User, Role } = require('../models');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');

class EntityService {
  // Crear entidad con usuario asociado
  static async createEntityWithUser(entityData) {
    const { documentNumber, entityType, businessName, legalRepresentative, email, phone, address } = entityData;

    // Verificar si ya existe una entidad con el mismo número de documento
    const existingEntity = await Entity.findOne({ where: { documentNumber } });
    if (existingEntity) {
      throw new Error('Ya existe una entidad con este número de documento');
    }

    // Verificar si ya existe un usuario con el mismo email
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new Error('Ya existe un usuario con este email');
    }

    // Crear la entidad
    const entity = await Entity.create({
      documentNumber,
      entityType,
      businessName,
      legalRepresentative,
      email,
      phone,
      address
    });

    // Buscar el rol 'USER'
    const userRole = await Role.findOne({ where: { name: 'USER' } });
    if (!userRole) {
      throw new Error('Rol USER no encontrado');
    }

    // Crear usuario asociado con el número de documento como contraseña inicial
    const hashedPassword = await bcrypt.hash(documentNumber, 10);
    const user = await User.create({
      username: email,
      email,
      password: hashedPassword,
      firstName: legalRepresentative,
      lastName: '',
      entityId: entity.id
    });

    // Asignar rol al usuario
    await user.addRole(userRole);

    return {
      entity,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      }
    };
  }

  // Obtener todas las entidades
  static async getAllEntities() {
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
  }

  // Obtener entidad por ID
  static async getEntityById(id) {
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
  }

  // Actualizar entidad
  static async updateEntity(id, updateData) {
    const { documentNumber, entityType, businessName, legalRepresentative, email, phone, address } = updateData;

    const entity = await Entity.findByPk(id);
    if (!entity) {
      throw new Error('Entidad no encontrada');
    }

    // Verificar si el nuevo número de documento ya existe (si se está cambiando)
    if (documentNumber && documentNumber !== entity.documentNumber) {
      const existingEntity = await Entity.findOne({ 
        where: { 
          documentNumber,
          id: { [Op.ne]: id }
        } 
      });
      if (existingEntity) {
        throw new Error('Ya existe una entidad con este número de documento');
      }
    }

    // Actualizar campos
    entity.documentNumber = documentNumber !== undefined ? documentNumber : entity.documentNumber;
    entity.entityType = entityType !== undefined ? entityType : entity.entityType;
    entity.businessName = businessName !== undefined ? businessName : entity.businessName;
    entity.legalRepresentative = legalRepresentative !== undefined ? legalRepresentative : entity.legalRepresentative;
    entity.email = email !== undefined ? email : entity.email;
    entity.phone = phone !== undefined ? phone : entity.phone;
    entity.address = address !== undefined ? address : entity.address;

    await entity.save();

    // Si hay un usuario asociado y se cambió el email o representante legal, actualizar usuario
    if (entity.userId && (email || legalRepresentative)) {
      const user = await User.findByPk(entity.userId);
      if (user) {
        if (email) {
          user.email = email;
          user.username = email;
        }
        if (legalRepresentative) {
          user.firstName = legalRepresentative;
        }
        await user.save();
      }
    }

    return entity;
  }

  // Eliminar entidad (soft delete)
  static async deleteEntity(id) {
    const entity = await Entity.findByPk(id);
    if (!entity) {
      throw new Error('Entidad no encontrada');
    }

    entity.isActive = false;
    await entity.save();

    return {
      id: entity.id,
      documentNumber: entity.documentNumber,
      businessName: entity.businessName,
      isActive: entity.isActive
    };
  }
}

module.exports = EntityService;