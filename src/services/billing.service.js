const { Request, Entity, User } = require('../models');
const { Op } = require('sequelize');

const BillingService = {
  /**
   * Obtener historial de solicitudes con filtros y paginación
   * @param {Object} filters - Filtros para la consulta
   * @param {string} filters.dateFrom - Fecha de inicio
   * @param {string} filters.dateTo - Fecha de fin
   * @param {Array} filters.status - Estados a filtrar
   * @param {number} filters.entityId - ID de la entidad
   * @param {number} filters.page - Página actual
   * @param {number} filters.limit - Límite de resultados por página
   * @returns {Object} Resultado con solicitudes y paginación
   */
  async getRequestsHistory(filters) {
    const {
      dateFrom,
      dateTo,
      status,
      entityId,
      page = 1,
      limit = 10
    } = filters;

    // Construir filtros dinámicos
    const whereClause = {
      active: true
    };

    // Filtro por rango de fechas
    if (dateFrom || dateTo) {
      whereClause.createdAt = {};
      if (dateFrom) {
        whereClause.createdAt[Op.gte] = new Date(dateFrom);
      }
      if (dateTo) {
        whereClause.createdAt[Op.lte] = new Date(dateTo + 'T23:59:59.999Z');
      }
    }

    // Filtro por estado
    if (status && status.length > 0) {
      whereClause.status = {
        [Op.in]: status
      };
    }

    // Filtro por entidad
    if (entityId) {
      whereClause.entityId = entityId;
    }

    // Calcular offset para paginación
    const offset = (page - 1) * limit;

    // Consulta con paginación e includes
    const { count, rows } = await Request.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Entity,
          as: 'entity',
          attributes: ['id', 'type', 'businessName', 'firstName', 'paternalSurname']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: offset
    });

    // Calcular información de paginación
    const totalPages = Math.ceil(count / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return {
      requests: rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: count,
        itemsPerPage: parseInt(limit),
        hasNextPage,
        hasPrevPage
      }
    };
  },

  /**
   * Obtener historial de reclutamientos con filtros y paginación
   * @param {Object} filters - Filtros para la consulta
   * @returns {Object} Resultado con reclutamientos y paginación (datos fijos temporales)
   */
  async getRecruitmentsHistory(filters) {
    const { page = 1, limit = 10 } = filters;

    // Datos fijos temporales - TODO: Implementar lógica real más adelante
    const recruitments = [
      {
        id: 1,
        recruitmentDate: new Date('2024-01-15'),
        candidateName: 'Juan Pérez García',
        candidateEmail: 'juan.perez@email.com',
        position: 'Desarrollador Frontend',
        status: 'COMPLETED',
        entityId: 1,
        createdAt: new Date('2024-01-10'),
        completedAt: new Date('2024-01-15')
      },
      {
        id: 2,
        recruitmentDate: new Date('2024-01-20'),
        candidateName: 'María González López',
        candidateEmail: 'maria.gonzalez@email.com',
        position: 'Diseñadora UX/UI',
        status: 'COMPLETED',
        entityId: 2,
        createdAt: new Date('2024-01-12'),
        completedAt: new Date('2024-01-20')
      },
      {
        id: 3,
        recruitmentDate: new Date('2024-01-25'),
        candidateName: 'Carlos Rodríguez Martín',
        candidateEmail: 'carlos.rodriguez@email.com',
        position: 'Backend Developer',
        status: 'COMPLETED',
        entityId: 1,
        createdAt: new Date('2024-01-18'),
        completedAt: new Date('2024-01-25')
      }
    ];

    const totalItems = recruitments.length;
    const totalPages = Math.ceil(totalItems / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return {
      recruitments,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems,
        itemsPerPage: parseInt(limit),
        hasNextPage,
        hasPrevPage
      }
    };
  }
};

module.exports = BillingService;