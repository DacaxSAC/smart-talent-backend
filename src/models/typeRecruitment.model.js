const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class TypeRecruitment extends Model {
    static associate(models) {
      TypeRecruitment.hasMany(models.Recruitment, {
        foreignKey: "typeRecruitmentId",
        as: "recruitments",
      });
    }
  }

  TypeRecruitment.init(
    {
      type: {
        type: DataTypes.ENUM(
          "RECLUTAMIENTO REGULAR",
          "HUNTING EJECUTIVO",
          "RECLUTAMIENTO MASIVO"
        ),
        allowNull: false,
        unique: true,
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
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notNull: {
            msg: "La descripcion aqui es fija",
          },
        },
      },
    },
    {
      sequelize,
      modelName: "TypeRecruitment",
    }
  );

  return TypeRecruitment;
};
