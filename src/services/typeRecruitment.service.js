const { TypeRecruitment } = require("../models");

const TypeRecruitmentService = {
  async createTypeRecruitment(data) {
    const { type, description } = data;

    // Verificar si el typerecruitment ya existe
    const existingTypeRecruitment = await TypeRecruitment.findOne({
      where: { type },
    });
    if (existingTypeRecruitment) {
      throw new Error("Ya existe un tipo de reclutamiento con este nombre");
    }

    const typeRecruitment = await TypeRecruitment.create({
      type,
      description,
    });

    return {
      message: "Tipo de reclutamiento creado exitosamente",
      typeRecruitment,
    };
  },

  async getAllTypeRecruitments() {
    const typeRecruitments = await TypeRecruitment.findAll({
      attributes: ["id", "type", "description"],
    });

    return {
      message: "Tipos de reclutamiento obtenidos exitosamente",
      typeRecruitments,
    };
  },

  async getTypeRecruitmentById(id) {
    const typeRecruitment = await TypeRecruitment.findByPk(id, {
      attributes: ["id", "type", "description"],
    });

    if (!typeRecruitment) {
      throw new Error("Tipo de reclutamiento no encontrado");
    }

    return {
      message: "Tipo de reclutamiento obtenido exitosamente",
      typeRecruitment,
    };
  },
};

module.exports = TypeRecruitmentService;
