const { validationResult } = require("express-validator");
const TypeRecruitmentService = require("../services/typeRecruitment.service");

const TypeRecruitmentController = {
  // Crear un nuevo tipo de reclutamiento
  create: async (req, res) => {
    try {
      // Verificar errores de validación
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const typeRecruitment =
        await TypeRecruitmentService.createTypeRecruitment(req.body);

      res.status(201).json({
        message: "Tipo de reclutamiento creado exitosamente",
        typeRecruitment,
      });
    } catch (error) {
      console.error("Error al crear tipo de reclutamiento:", error);
      const statusCode =
        error.message === "El tipo de reclutamiento ya existe" ? 400 : 500;
      res.status(statusCode).json({ message: error.message });
    }
  },

  // Obtener todos los tipos de reclutamiento
  getAll: async (req, res) => {
    try {
      const typeRecruitments =
        await TypeRecruitmentService.getAllTypeRecruitments();
      res.status(200).json(typeRecruitments);
    } catch (error) {
      console.error("Error al obtener tipos de reclutamiento:", error);
      res.status(500).json({ message: error.message });
    }
  },

  // Obtener un tipo de reclutamiento por ID
  getById: async (req, res) => {
    try {
      const typeRecruitment =
        await TypeRecruitmentService.getTypeRecruitmentById(req.params.id);
      res.status(200).json(typeRecruitment);
    } catch (error) {
      console.error("Error al obtener tipo de reclutamiento:", error);
      const statusCode =
        error.message === "Tipo de reclutamiento no encontrado" ? 404 : 500;
      res.status(statusCode).json({ message: error.message });
    }
  },
};

module.exports = { TypeRecruitmentController };
