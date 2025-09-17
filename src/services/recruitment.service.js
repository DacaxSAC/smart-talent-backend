const { Recruitment, ProfileUp, Entity } = require('../models');
const { sequelize } = require('../config/database');
const { Op } = require('sequelize');

const RecruitmentService = {
  async createRecruitmentWithProfile(data) {
    const t = await sequelize.transaction();

    try {
      const { recruitmentType, entityId, profileData, createdBy } = data;

      // Verificar que la entidad existe
      const entity = await Entity.findByPk(entityId, { transaction: t });
      if (!entity) {
        await t.rollback();
        throw new Error('Entidad no encontrada');
      }

      // Validar tipo de reclutamiento
      const validTypes = ['RECLUTAMIENTO REGULAR', 'HUNTING EJECUTIVO', 'RECLUTAMIENTO MASIVO'];
      if (!validTypes.includes(recruitmentType)) {
        await t.rollback();
        throw new Error('Tipo de reclutamiento no válido');
      }

      // Crear el reclutamiento
      const recruitment = await Recruitment.create(
        {
          type: recruitmentType,
          entityId,
          state: 'PENDIENTE',
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
          paymentFrequency: profileData.paymentFrequency,
          benefits: profileData.benefits,
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

      await t.commit();

      // Retornar los datos creados con las relaciones
      const result = await Recruitment.findByPk(recruitment.id, {
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

      return result;
    } catch (error) {
      await t.rollback();
      throw error;
    }
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
            attributes: ['id', 'name', 'ruc']
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
            attributes: ['id', 'name', 'ruc']
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
      const profileUp = await ProfileUp.findOne({
        where: { recruitmentId },
        include: [
          {
            model: Recruitment,
            as: 'recruitment',
            include: [
              {
                model: Entity,
                as: 'entity',
                attributes: ['id', 'name', 'ruc']
              }
            ]
          }
        ]
      });

      return profileUp;
    } catch (error) {
      throw error;
    }
  }
};

module.exports = RecruitmentService;