const { Op } = require('sequelize');
const { Entity, User, Role } = require('../models');
const { sendEmailCreateUser } = require('./email.service');
const { sequelize } = require('../config/database');
const PasswordGenerator = require('../utils/passwordGenerator');

const EntityService = {
  /**
   * Crea una entidad con su usuario asociado usando transacciones
   * @param {Object} data - Datos de la entidad y usuario
   * @returns {Object} Resultado con entidad y usuario creados
   */
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

    // Iniciar transacción
    const transaction = await sequelize.transaction();

    try {
      // Verificar si la entidad ya existe por documento
      const entityExists = await Entity.findOne({ 
        where: { documentNumber },
        transaction
      });
      if (entityExists) {
        throw new Error('Ya existe una entidad con este número de documento');
      }

      // Verificar si ya existe un usuario con ese email
      const userExists = await User.findOne({
        where: { email, active: true },
        transaction
      });
      if (userExists) {
        throw new Error('Ya existe un usuario con este email');
      }

      // Obtener el rol USER
      const userRole = await Role.findOne({ 
        where: { name: 'USER' },
        transaction
      });
      if (!userRole) {
        throw new Error('Error al asignar rol: Rol USER no encontrado');
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
      }, { transaction });

      // Generar contraseña segura
      const userPassword = PasswordGenerator.generateSecure(12);

      // Crear usuario asociado
      const user = await User.create({
        username: type === 'NATURAL'
          ? `${firstName} ${paternalSurname} ${maternalSurname}`
          : businessName,
        email,
        password: userPassword,
        active: true,
        entityId: entity.id
      }, { transaction });

      // Asignar rol al usuario
      await user.setRoles([userRole], { transaction });

      // Obtener el usuario con roles para la respuesta
      const userWithRoles = await User.findByPk(user.id, {
        attributes: { exclude: ['password'] },
        include: [{
          model: Role,
          attributes: ['id', 'name'],
          through: { attributes: [] }
        }],
        transaction
      });

      // Enviar correo con las credenciales 
      await sendEmailCreateUser(user.email, userPassword);
      
      // Confirmar transacción
      await transaction.commit();

      return {
        message: 'Entidad y usuario creados exitosamente',
        entity,
        user: userWithRoles
      };

    } catch (error) {
      // Revertir transacción en caso de error
      await transaction.rollback();
      throw error;
    }
  },

  /**
   * Obtiene todas las entidades (activas e inactivas) con sus usuarios asociados
   * @returns {Array} Lista de todas las entidades
   */
  async getAllEntities() {
    return await Entity.findAll({
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'email','entityId', 'active'],
        required: false, // LEFT JOIN para incluir entidades sin usuario
        include: [{
          model: Role,
          attributes: ['name'],
          through: { attributes: [] }
        }]
      }]
    });
  },

  /**
   * Obtiene una entidad activa por ID con su usuario asociado
   * @param {number} id - ID de la entidad
   * @returns {Object} Entidad encontrada
   */
  async getEntityById(id) {
    const entity = await Entity.findByPk(id, {
      where: { active: true }, // Solo entidades activas
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'email'],
        where: { active: true }, // Solo usuarios activos
        required: false, // LEFT JOIN para incluir entidades sin usuario
        include: [{
          model: Role,
          attributes: ['name'],
          through: { attributes: [] }
        }]
      }]
    });

    if (!entity || !entity.active) {
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

  /**
   * Realiza soft delete de una entidad y su usuario asociado
   * @param {number} id - ID de la entidad
   * @returns {Object} Mensaje de confirmación
   */
  async deleteEntity(id) {
    // Iniciar transacción para mantener consistencia
    const transaction = await sequelize.transaction();

    try {
      // Buscar la entidad con su usuario asociado
      const entity = await Entity.findByPk(id, {
        include: [{
          model: User,
          as: 'user',
          attributes: ['id', 'active']
        }],
        transaction
      });

      if (!entity) {
        await transaction.rollback();
        throw new Error('Entidad no encontrada');
      }

      // Verificar si la entidad ya está inactiva
      if (!entity.active) {
        await transaction.rollback();
        throw new Error('La entidad ya está eliminada');
      }

      // Realizar soft delete de la entidad
      await Entity.update(
        { active: false },
        { 
          where: { id },
          transaction
        }
      );

      // Si existe un usuario asociado, también realizar soft delete
       if (entity.user) {
         await User.update(
           { active: false },
           {
             where: { entityId: id },
             transaction
           }
         );
       }

      // Confirmar transacción
      await transaction.commit();

      return { message: 'Entidad eliminada exitosamente (soft delete)' };

    } catch (error) {
      // Revertir transacción en caso de error
      await transaction.rollback();
      throw error;
    }
  },

  /**
   * Reactiva una entidad y su usuario asociado (revertir soft delete)
   * @param {number} id - ID de la entidad
   * @returns {Object} Mensaje de confirmación
   */
  async reactivateEntity(id) {
    // Iniciar transacción para mantener consistencia
    const transaction = await sequelize.transaction();

    try {
      // Buscar la entidad con su usuario asociado
      const entity = await Entity.findByPk(id, {
        include: [{
          model: User,
          as: 'user',
          attributes: ['id', 'active']
        }],
        transaction
      });

      if (!entity) {
        await transaction.rollback();
        throw new Error('Entidad no encontrada');
      }

      // Verificar si la entidad ya está activa
      if (entity.active) {
        await transaction.rollback();
        throw new Error('La entidad ya está activa');
      }

      // Reactivar la entidad
      await Entity.update(
        { active: true },
        { 
          where: { id },
          transaction
        }
      );

      // Si existe un usuario asociado, también reactivarlo
      if (entity.user) {
        await User.update(
          { active: true },
          {
            where: { entityId: id },
            transaction
          }
        );
      }

      // Confirmar transacción
      await transaction.commit();

      return { message: 'Entidad reactivada exitosamente' };

    } catch (error) {
      // Revertir transacción en caso de error
      await transaction.rollback();
      throw error;
    }
  }
};

module.exports = EntityService;