const { Recruitment, ProfileUp, Entity } = require('../models');
const { sequelize } = require('../config/database');
const { Op } = require('sequelize');
const { withTransaction, canRollback } = require('../utils/transactionHelper');

const RecruitmentService = {
  async createRecruitmentWithProfile(data) {
    const { recruitmentType, entityId, profileData, createdBy } = data;

    const result = await withTransaction(async (t) => {
      // Verificar que la entidad existe
      const entity = await Entity.findByPk(entityId, { transaction: t });
      if (!entity) {
        throw new Error('Entidad no encontrada');
      }

      // Mapear tipos de reclutamiento del frontend al backend
      const typeMapping = {
        'regular': 'RECLUTAMIENTO REGULAR',
        'executive': 'HUNTING EJECUTIVO',
        'massive': 'RECLUTAMIENTO MASIVO'
      };

      const mappedType = typeMapping[recruitmentType] || recruitmentType;

      // Mapeo de frecuencia de pago
      const paymentFrequencyMapping = {
        'semanal': 'SEMANAL',
        'quincenal': 'QUINCENAL',
        'mensual': 'MENSUAL'
      };
      const mappedPaymentFrequency = profileData.paymentFrequency ? 
        (paymentFrequencyMapping[profileData.paymentFrequency.toLowerCase()] || profileData.paymentFrequency) : 
        profileData.paymentFrequency;

      // Validar tipo de reclutamiento
      const validTypes = ['RECLUTAMIENTO REGULAR', 'HUNTING EJECUTIVO', 'RECLUTAMIENTO MASIVO'];
      if (!validTypes.includes(mappedType)) {
        throw new Error('Tipo de reclutamiento no válido');
      }

      // Crear el reclutamiento
      const recruitment = await Recruitment.create(
        {
          type: mappedType,
          entityId,
          state: 'PENDIENTE',
          description: data.description || 'Descripción del reclutamiento',
          date: data.date || new Date(),
          options: data.options || 'Opciones por defecto',
          progress: data.progress || 0,
          createdBy
        },
        { transaction: t }
      );

      // Crear el ProfileUp vinculado al reclutamiento
      const profileUp = await ProfileUp.create(
        {
          recruitmentId: recruitment.id,
          entityId,
          // Datos generales
          positionName: profileData.positionName,
          area: profileData.area,
          reportsTo: profileData.reportsTo,
          supervises: profileData.supervises,
          // Especificaciones del puesto
          workLocation: profileData.workLocation,
          workSchedule: profileData.workSchedule,
          workModality: profileData.workModality,
          contractType: profileData.contractType,
          // Funciones del puesto
          jobFunctions: profileData.jobFunctions || [],
          // Propuesta salarial y beneficios
          salaryRangeFrom: profileData.salaryRangeFrom,
          salaryRangeTo: profileData.salaryRangeTo,
          bonuses: profileData.bonuses,
          paymentFrequency: mappedPaymentFrequency,
          benefits: typeof profileData.benefits === 'object' ? JSON.stringify(profileData.benefits) : profileData.benefits,
          // Experiencia laboral
          experienceTime: profileData.experienceTime,
          positionExperience: profileData.positionExperience,
          // Competencias personales
          personalCompetencies: profileData.personalCompetencies || [],
          // Observaciones adicionales
          additionalObservations: profileData.additionalObservations || [],
          // Formación
          educationLevel: profileData.educationLevel,
          educationStatus: profileData.educationStatus,
          academicLevel: profileData.academicLevel,
          professionalCareer: profileData.professionalCareer,
          // Especializaciones y conocimientos adicionales
          specializations: profileData.specializations || [],
          languages: profileData.languages || [],
          computerSkills: profileData.computerSkills || [],
          // Estado y auditoría
          status: 'COMPLETADO',
          createdBy
        },
        { transaction: t }
      );

      return recruitment.id;
    });

    // Retornar los datos creados con las relaciones (fuera de la transacción)
    const finalResult = await Recruitment.findByPk(result, {
      include: [
        {
          model: ProfileUp,
          as: 'profileUps'
        },
        {
          model: Entity,
          as: 'entity',
          attributes: ['id', 'type', 'documentNumber', 'firstName', 'paternalSurname', 'maternalSurname', 'businessName']
        }
      ]
    });

    return finalResult;
  },

  async getRecruitments(filters = {}) {
    try {
      const { entityId, status } = filters;
      const whereClause = {};

      if (entityId) {
        whereClause.entityId = entityId;
      }

      if (status) {
        whereClause.state = status;
      }

      const recruitments = await Recruitment.findAll({
        where: whereClause,
        include: [
          {
            model: ProfileUp,
            as: 'profileUps'
          },
          {
            model: Entity,
            as: 'entity',
            attributes: ['id', 'type', 'documentNumber', 'firstName', 'paternalSurname', 'maternalSurname', 'businessName']
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      return recruitments;
    } catch (error) {
      throw error;
    }
  },

  async getRecruitmentById(recruitmentId) {
    try {
      const recruitment = await Recruitment.findByPk(recruitmentId, {
        include: [
          {
            model: ProfileUp,
            as: 'profileUps'
          },
          {
            model: Entity,
            as: 'entity',
            attributes: ['id', 'type', 'documentNumber', 'firstName', 'paternalSurname', 'maternalSurname', 'businessName']
          }
        ]
      });

      return recruitment;
    } catch (error) {
      throw error;
    }
  },

  async updateRecruitmentStatus(recruitmentId, newStatus) {
    try {
      const validStatuses = ['PENDIENTE', 'OBSERVACIÓN', 'EN PROCESO', 'VERIFICACIÓN', 'TERMINADO'];
      
      if (!validStatuses.includes(newStatus)) {
        throw new Error('Estado no válido');
      }

      const recruitment = await Recruitment.findByPk(recruitmentId);
      
      if (!recruitment) {
        throw new Error('Reclutamiento no encontrado');
      }

      recruitment.state = newStatus;
      await recruitment.save();

      // Retornar el reclutamiento actualizado con sus relaciones
      const updatedRecruitment = await Recruitment.findByPk(recruitmentId, {
        include: [
          {
            model: ProfileUp,
            as: 'profileUps'
          },
          {
            model: Entity,
            as: 'entity',
            attributes: ['id', 'name', 'ruc']
          }
        ]
      });

      return updatedRecruitment;
    } catch (error) {
      throw error;
    }
  },

  async getProfileUpByRecruitmentId(recruitmentId) {
    try {
      const recruitment = await Recruitment.findByPk(recruitmentId, {
        include: [{
          model: ProfileUp,
          as: 'profileUp'
        }]
      });

      if (!recruitment) {
        throw new Error('Reclutamiento no encontrado');
      }

      return recruitment.profileUp;
    } catch (error) {
      console.error('Error al obtener ProfileUp por ID de reclutamiento:', error);
      throw error;
    }
  },

  async deleteRecruitment(recruitmentId) {
    const result = await withTransaction(async (t) => {
      // Buscar el reclutamiento con sus perfiles asociados
      const recruitment = await Recruitment.findByPk(recruitmentId, {
        include: [{
          model: ProfileUp,
          as: 'profileUps'
        }],
        transaction: t
      });

      if (!recruitment) {
        return false;
      }

      // Eliminar los perfiles asociados si existen
      if (recruitment.profileUps && recruitment.profileUps.length > 0) {
        await ProfileUp.destroy({
          where: { recruitmentId: recruitmentId },
          transaction: t
        });
      }

      // Eliminar el reclutamiento
      await Recruitment.destroy({
        where: { id: recruitmentId },
        transaction: t
      });

      return true;
    });

    return result;
  }
};

module.exports = RecruitmentService;