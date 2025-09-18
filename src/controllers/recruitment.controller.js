const { validationResult } = require('express-validator');
const RecruitmentService = require('../services/recruitment.service');

const RecruitmentController = {
  createRecruitmentWithProfile: async (req, res) => {
    try {
      // Validar entrada
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { type, profileUp } = req.body;

      // Validar que se proporcionen los datos requeridos
      if (!type || !profileUp) {
        return res.status(400).json({
          message: 'Tipo de reclutamiento y datos del perfil son requeridos'
        });
      }

      // Mapear los campos del frontend al formato del backend
      const jobFunctions = {
        objetivo: profileUp.objetivo || '',
        descripcion: profileUp.descripcion || []
      };

      const profileData = {
        // Datos generales
        positionName: profileUp.nombrePuesto,
        area: profileUp.naturalezaPuesto, // naturalezaPuesto -> area
        reportsTo: profileUp.solicitadoPor, // solicitadoPor -> reportsTo
        supervises: profileUp.tipoPersonalRequerido, // tipoPersonalRequerido -> supervises
        
        // Especificaciones del puesto
        contractConditions: profileUp.condicionesContratacion,
        contractType: profileUp.tipoConvocatoria, // tipoConvocatoria -> contractType
        numberOfVacancies: profileUp.numeroVacantes ? parseInt(profileUp.numeroVacantes) : null,
        tentativeStartDate: profileUp.fechaTentativaInicio || null,
        residenceLocation: profileUp.lugarResidencia,
        workLocation: profileUp.lugarTrabajo,
        workSchedule: profileUp.horarioTrabajo, // horarioTrabajo -> workSchedule
        workModality: profileUp.modalidadTrabajo, // modalidadTrabajo -> workModality
        drivingLicense: profileUp.licenciaConducir,
        
        // Funciones del puesto
        jobFunctions,
        
        // Propuesta salarial y beneficios
        salaryRangeFrom: profileUp.rangoSalarialMin ? parseFloat(profileUp.rangoSalarialMin) : null,
        salaryRangeTo: profileUp.rangoSalarialMax ? parseFloat(profileUp.rangoSalarialMax) : null,
        bonuses: profileUp.bonos,
        paymentFrequency: profileUp.frecuenciaPago,
        benefits: profileUp.beneficios,
        
        // Competencias personales
        personalCompetencies: profileUp.competenciasPersonales || [],
        
        // Observaciones adicionales
        additionalObservations: profileUp.observacionesAdicionales || [],
        
        // Formación
        educationLevel: profileUp.gradoInstruccion,
        educationStatus: profileUp.completaIncompleta ? profileUp.completaIncompleta.toUpperCase() : null,
        academicLevel: profileUp.nivelAcademico,
        professionalCareer: profileUp.carreraProfesional,
        
        // Especializaciones y conocimientos adicionales
        specializations: profileUp.especializaciones || [],
        languages: [{
          language: profileUp.idioma || '',
          level: profileUp.nivelIdioma || ''
        }],
        computerSkills: [{
          skill: profileUp.informatica || '',
          level: profileUp.nivelInformatica || ''
        }]
      };

      const result = await RecruitmentService.createRecruitmentWithProfile({
         recruitmentType: type,
         entityId: 1, // Por ahora usar un entityId fijo, esto debería venir del usuario autenticado
         profileData,
         createdBy: req.user?.id // Asumiendo que el usuario está en req.user
       });

      res.status(201).json({
        message: 'Reclutamiento y perfil creados exitosamente',
        data: result
      });
    } catch (error) {
      console.error('Error al crear reclutamiento con perfil:', error);
      
      let statusCode = 500;
      let message = 'Error interno del servidor';
      
      if (error.message === 'Entidad no encontrada') {
        statusCode = 404;
        message = error.message;
      } else if (error.message.includes('requerido') || error.message.includes('válido')) {
        statusCode = 400;
        message = error.message;
      }
      
      res.status(statusCode).json({ 
        message,
        error: error.message 
      });
    }
  },

  getRecruitments: async (req, res) => {
    try {
      const { entityId, status } = req.query;
      const result = await RecruitmentService.getRecruitments({ entityId, status });
      
      res.status(200).json({
        message: 'Reclutamientos obtenidos exitosamente',
        recruitments: result
      });
    } catch (error) {
      console.error('Error al obtener reclutamientos:', error);
      res.status(500).json({ 
        message: 'Error al obtener los reclutamientos',
        error: error.message 
      });
    }
  },

  getRecruitmentById: async (req, res) => {
    try {
      const { id } = req.params;
      const result = await RecruitmentService.getRecruitmentById(id);
      
      if (!result) {
        return res.status(404).json({
          message: 'Reclutamiento no encontrado'
        });
      }
      
      res.status(200).json({
        message: 'Reclutamiento obtenido exitosamente',
        data: result
      });
    } catch (error) {
      console.error('Error al obtener reclutamiento:', error);
      res.status(500).json({ 
        message: 'Error al obtener el reclutamiento',
        error: error.message 
      });
    }
  },

  getRecruitmentsByEntity: async (req, res) => {
    try {
      const { entityId } = req.params;
      const { status } = req.query;
      
      if (!entityId) {
        return res.status(400).json({
          message: 'ID de entidad es requerido'
        });
      }

      const result = await RecruitmentService.getRecruitments({ entityId, status });
      
      res.status(200).json({
        message: 'Reclutamientos de la entidad obtenidos exitosamente',
        recruitments: result
      });
    } catch (error) {
      console.error('Error al obtener reclutamientos por entidad:', error);
      res.status(500).json({ 
        message: 'Error al obtener los reclutamientos de la entidad',
        error: error.message 
      });
    }
  },

  updateRecruitmentStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      if (!status) {
        return res.status(400).json({
          message: 'El estado es requerido'
        });
      }
      
      const result = await RecruitmentService.updateRecruitmentStatus(id, status);
      
      res.status(200).json({
        message: 'Estado del reclutamiento actualizado exitosamente',
        data: result
      });
    } catch (error) {
      console.error('Error al actualizar estado del reclutamiento:', error);
      
      let statusCode = 500;
      let message = 'Error interno del servidor';
      
      if (error.message === 'Reclutamiento no encontrado') {
        statusCode = 404;
        message = error.message;
      }
      
      res.status(statusCode).json({ 
        message,
        error: error.message 
      });
    }
  },

  deleteRecruitment: async (req, res) => {
    try {
      const { id } = req.params;
      // Cualquier usuario autenticado puede eliminar reclutamientos

      const deleted = await RecruitmentService.deleteRecruitment(id);
      
      if (!deleted) {
        return res.status(404).json({
          message: 'Reclutamiento no encontrado'
        });
      }

      res.json({
        message: 'Reclutamiento eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error al eliminar reclutamiento:', error);
      res.status(500).json({
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }
};

module.exports = RecruitmentController;