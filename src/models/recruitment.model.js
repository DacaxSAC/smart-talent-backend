const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class Recruitment extends Model {
    //Una entidad puede tener muchos reclutamiento.
    static associate(models) {
      Recruitment.belongsTo(models.Entity, {
        foreignKey: "entityId",
        as: "entity",
      });

      // Relación con TypeRecruitment
      Recruitment.belongsTo(models.TypeRecruitment, {
        foreignKey: "typeRecruitmentId",
        as: "typeRecruitment",
      });
    }
  }

  Recruitment.init(
    {
      typeRecruitmentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "TypeRecruitments",
          key: "id",
        },
        validate: {
          notNull: {
            msg: "Debe seleccionar un tipo de reclutamiento",
          },
          isInt: {
            msg: "El tipo de reclutamiento debe ser un ID válido",
          },
        },
      },
      state: {
        type: DataTypes.ENUM(
          "PENDIENTE",
          "OBSERVACIÓN",
          "EN PROCESO",
          "VERIFICACIÓN",
          "TERMINADO"
        ),
        allowNull: false,
        unique: false,
        validate: {
          notNull: {
            msg: "El tipo de estado de reclutamiento es requerido",
          },
          isIn: {
            args: [
              [
                "PENDIENTE",
                "OBSERVACIÓN",
                "EN PROCESO",
                "VERIFICACIÓN",
                "TERMINADO",
              ],
            ],
            msg: "El tipo de estado de reclutamiento debe ser PENDIENTE o OBSERVACIÓN o EN PROCESO o VERIFICACIÓN o TERMINADO",
          },
        },
      },
      date: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
          isDate: {
            msg: "La fecha debe ser una fecha válida",
          },
        },
      },
      options: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Se debe indicar las opciones del reclutamiento",
          },
        },
      },
      progress: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: {
            msg: "El indicativo del progreso es obligatorio",
          },
        },
      },
    },
    {
      sequelize,
      modelName: "Recruitment",
    }
  );

  return Recruitment;
};
