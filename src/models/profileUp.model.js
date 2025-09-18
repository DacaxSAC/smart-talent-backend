const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class ProfileUp extends Model {
    static associate(models) {
      // Un ProfileUp pertenece a un Recruitment
      ProfileUp.belongsTo(models.Recruitment, {
        foreignKey: "recruitmentId",
        as: "recruitment",
      });
      
      // Un ProfileUp pertenece a una Entity
      ProfileUp.belongsTo(models.Entity, {
        foreignKey: "entityId",
        as: "entity",
      });
    }
  }

  ProfileUp.init(
    {
      // Datos generales
      positionName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: {
            msg: "El nombre del puesto es requerido",
          },
          notEmpty: {
            msg: "El nombre del puesto no puede estar vacío",
          },
        },
      },
      area: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      reportsTo: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      supervises: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      // Campos adicionales del formulario
      requestedBy: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      positionNature: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      requiredPersonnelType: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      callType: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      
      // Especificaciones del puesto
      contractConditions: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      workSchedule: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      workModality: {
        type: DataTypes.ENUM('PRESENCIAL', 'REMOTO', 'HÍBRIDO'),
        allowNull: true,
      },
      contractType: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      numberOfVacancies: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      tentativeStartDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      residenceLocation: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      workLocation: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      drivingLicense: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      
      // Funciones del puesto
      jobFunctions: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
      },
      
      // Propuesta salarial y beneficios
      salaryRangeFrom: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      salaryRangeTo: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      bonuses: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      paymentFrequency: {
        type: DataTypes.ENUM('SEMANAL', 'QUINCENAL', 'MENSUAL'),
        allowNull: true,
      },
      benefits: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      
      // Experiencia laboral
      experienceTime: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      positionExperience: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      
      // Competencias personales
      personalCompetencies: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
      },
      
      // Observaciones adicionales
      additionalObservations: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
      },
      
      // Formación
      educationLevel: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      educationStatus: {
        type: DataTypes.ENUM('COMPLETA', 'INCOMPLETA'),
        allowNull: true,
      },
      academicLevel: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      professionalCareer: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      
      // Especializaciones y conocimientos adicionales
      specializations: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
      },
      languages: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
      },
      computerSkills: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
      },
      
      // Estado del perfil
      status: {
        type: DataTypes.ENUM('BORRADOR', 'COMPLETADO', 'APROBADO'),
        allowNull: false,
        defaultValue: 'BORRADOR',
      },
      
      // Campos de auditoría
      createdBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      updatedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "ProfileUp",
      tableName: "profile_ups",
      timestamps: true,
      paranoid: true, // Soft delete
      underscored: true,
    }
  );

  return ProfileUp;
};