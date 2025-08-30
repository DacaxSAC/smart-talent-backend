const { FirebaseInstallationsError } = require("firebase-admin/installations");
const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class Recruitment extends Model {
    //Una entidad puede tener muchos reclutamiento, pero un reclutamiento solo es de una entidade
    static associate(models) {
      Recruitment.belongsTo(models.Entity, {
        foreignKey: "entityId",
        as: "entity",
      });
    }
  }

  Recruitment.init(
    {
      type: {
        type: DataTypes.ENUM(
          "RECLUTAMIENTO REGULAR",
          "HUNTING EJECUTIVO",
          "RECLUTAMIENTO MASIVO"
        ),
        allowNull: false,
        validate: {
          notNull: {
            msg: "El tipo de reclutamiento es requerido",
          },
          isIn: {
            args: [
              [
                "RECLUTAMIENTO REGULAR",
                "HUNTING EJECUTIVO",
                "RECLUTAMIENTO MASIVO",
              ],
            ],
            msg: "El tipo de reclutamiento debe ser REGULAR o EJECUTIVO o MASIVO",
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
      description: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: {
            msg: "El tipo de estado de reclutamiento es requerido",
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
