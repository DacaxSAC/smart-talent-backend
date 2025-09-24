const express = require("express");
const router = express.Router();
const RecruitmentController = require("../controllers/recruitment.controller");
const {
  authMiddleware,
  roleMiddleware,
} = require("../middleware/auth.middleware");

/**
 * @swagger
 * /recruitments:
 *   post:
 *     summary: Crear un nuevo reclutamiento con perfil de puesto
 *     tags: [Recruitments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - recruitmentType
 *               - entityId
 *               - profileData
 *             properties:
 *               recruitmentType:
 *                 type: string
 *                 enum: [RECLUTAMIENTO REGULAR, HUNTING EJECUTIVO, RECLUTAMIENTO MASIVO]
 *                 description: Tipo de reclutamiento
 *               entityId:
 *                 type: integer
 *                 description: ID de la entidad
 *               profileData:
 *                 type: object
 *                 properties:
 *                   positionName:
 *                     type: string
 *                     description: Nombre del puesto
 *                   area:
 *                     type: string
 *                     description: Área del puesto
 *                   reportsTo:
 *                     type: string
 *                     description: A quién reporta
 *                   supervises:
 *                     type: string
 *                     description: A quién supervisa
 *                   workLocation:
 *                     type: string
 *                     description: Ubicación de trabajo
 *                   workSchedule:
 *                     type: string
 *                     description: Horario de trabajo
 *                   workModality:
 *                     type: string
 *                     enum: [PRESENCIAL, REMOTO, HÍBRIDO]
 *                     description: Modalidad de trabajo
 *                   contractType:
 *                     type: string
 *                     description: Tipo de contrato
 *                   jobFunctions:
 *                     type: array
 *                     items:
 *                       type: string
 *                     description: Funciones del puesto
 *                   salaryRangeFrom:
 *                     type: number
 *                     description: Rango salarial desde
 *                   salaryRangeTo:
 *                     type: number
 *                     description: Rango salarial hasta
 *                   bonuses:
 *                     type: string
 *                     description: Bonos
 *                   paymentFrequency:
 *                     type: string
 *                     enum: [SEMANAL, QUINCENAL, MENSUAL]
 *                     description: Frecuencia de pago
 *                   benefits:
 *                     type: string
 *                     description: Beneficios
 *                   experienceTime:
 *                     type: string
 *                     description: Tiempo de experiencia
 *                   positionExperience:
 *                     type: string
 *                     description: Experiencia en el puesto
 *                   personalCompetencies:
 *                     type: array
 *                     items:
 *                       type: string
 *                     description: Competencias personales
 *                   additionalObservations:
 *                     type: array
 *                     items:
 *                       type: string
 *                     description: Observaciones adicionales
 *                   educationLevel:
 *                     type: string
 *                     description: Grado de instrucción
 *                   educationStatus:
 *                     type: string
 *                     enum: [COMPLETA, INCOMPLETA]
 *                     description: Estado de la educación
 *                   academicLevel:
 *                     type: string
 *                     description: Nivel académico
 *                   professionalCareer:
 *                     type: string
 *                     description: Carrera profesional
 *                   specializations:
 *                     type: array
 *                     items:
 *                       type: string
 *                     description: Especializaciones
 *                   languages:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         language:
 *                           type: string
 *                         level:
 *                           type: string
 *                     description: Idiomas
 *                   computerSkills:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         skill:
 *                           type: string
 *                         level:
 *                           type: string
 *                     description: Conocimientos informáticos
 *     responses:
 *       201:
 *         description: Reclutamiento y perfil creados exitosamente
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Entidad no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.post(
  "/",
  [authMiddleware, roleMiddleware(["ADMIN", "USER"])],
  RecruitmentController.createRecruitmentWithProfile
);

/**
 * @swagger
 * /recruitments:
 *   get:
 *     summary: Obtener lista de reclutamientos
 *     tags: [Recruitments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: entityId
 *         schema:
 *           type: integer
 *         description: Filtrar por ID de entidad
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDIENTE, OBSERVACIÓN, EN PROCESO, VERIFICACIÓN, TERMINADO]
 *         description: Filtrar por estado
 *     responses:
 *       200:
 *         description: Lista de reclutamientos obtenida exitosamente
 *       500:
 *         description: Error interno del servidor
 */
router.get(
  "/",
  [authMiddleware, roleMiddleware(["ADMIN", "USER", "RECRUITER"])],
  RecruitmentController.getRecruitments
);

/**
 * @swagger
 * /recruitments/{id}:
 *   get:
 *     summary: Obtener un reclutamiento por ID
 *     tags: [Recruitments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del reclutamiento
 *     responses:
 *       200:
 *         description: Reclutamiento obtenido exitosamente
 *       404:
 *         description: Reclutamiento no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.get(
  "/:id",
  [authMiddleware, roleMiddleware(["ADMIN", "USER", "RECRUITER"])],
  RecruitmentController.getRecruitmentById
);

/**
 * @swagger
 * /recruitments/{id}/status:
 *   patch:
 *     summary: Actualizar el estado de un reclutamiento
 *     tags: [Recruitments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del reclutamiento
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDIENTE, OBSERVACIÓN, EN PROCESO, VERIFICACIÓN, TERMINADO]
 *                 description: Nuevo estado del reclutamiento
 *     responses:
 *       200:
 *         description: Estado actualizado exitosamente
 *       400:
 *         description: Estado inválido
 *       404:
 *         description: Reclutamiento no encontrado
 *       500:
 *         description: Error interno del servidor
 */
/**
 * @swagger
 * /recruitments/entity/{entityId}:
 *   get:
 *     summary: Obtener reclutamientos por entidad
 *     tags: [Recruitments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: entityId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la entidad
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filtrar por estado del reclutamiento
 *     responses:
 *       200:
 *         description: Reclutamientos de la entidad obtenidos exitosamente
 *       400:
 *         description: ID de entidad requerido
 *       500:
 *         description: Error interno del servidor
 */

//Se puede poner más roles
router.get(
  "/state/:stateFilter",
  [authMiddleware, roleMiddleware(["ADMIN"])],
  RecruitmentController.getRecruitmentsByStateGroup
);

//Se puede poner más roles
router.get(
  "/clients-state/:state",
  [authMiddleware, roleMiddleware(["ADMIN"])],
  RecruitmentController.getClientNamesByState
);

router.get(
  "/entity/:entityId",
  [authMiddleware, roleMiddleware(["ADMIN", "USER", "RECRUITER"])],
  RecruitmentController.getRecruitmentsByEntity
);

router.patch(
  "/:id/status",
  [authMiddleware, roleMiddleware(["ADMIN", "RECRUITER"])],
  RecruitmentController.updateRecruitmentStatus
);

/**
 * @swagger
 * /recruitments/{id}:
 *   delete:
 *     summary: Eliminar un reclutamiento
 *     tags: [Recruitments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del reclutamiento a eliminar
 *     responses:
 *       200:
 *         description: Reclutamiento eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Reclutamiento eliminado exitosamente
 *       404:
 *         description: Reclutamiento no encontrado
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado
 *       500:
 *         description: Error del servidor
 */
router.delete(
  "/:id",
  [authMiddleware, roleMiddleware(["ADMIN", "RECRUITER", "USER"])],
  RecruitmentController.deleteRecruitment
);

module.exports = router;
