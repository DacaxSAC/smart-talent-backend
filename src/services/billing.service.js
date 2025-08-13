const { Request, Entity, Person, Document, DocumentType } = require('../models');
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
          attributes: ['id', 'type', 'businessName', 'firstName', 'paternalSurname', 'documentNumber']
        },
        {
          model: Person,
          as: 'persons',
          attributes: ['id', 'dni', 'fullname', 'status'],
          include: [
            {
              model: Document,
              as: 'documents',
              attributes: ['id', 'name', 'status'],
              include: [
                {
                  model: DocumentType,
                  as: 'documentType',
                  attributes: ['name']
                }
              ]
            }
          ]
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

    // Obtener todos los tipos de documento existentes
    const allDocTypes = await DocumentType.findAll({ attributes: ['name'] });

    // Transformar datos al formato solicitado, asegurando que aparezca cada tipo de documento
    const transformedRequests = rows.map(request => {
      // Usaremos la primera persona para los documentos (asunción actual)
      const mainPerson = request.persons && request.persons.length > 0 ? request.persons[0] : null;
      const personDocs = mainPerson ? mainPerson.documents || [] : [];

      // Construir lista completa de documentos por tipo
      const completeDocs = allDocTypes.map(dt => {
        const found = personDocs.filter(d => d.documentType && d.documentType.name === dt.name);
        return {
          name: dt.name,
          numberDocsCompleted: found ? found.map(d => d.status).filter(s => s === 'Realizado').length : 0,
        };
      });

      return {
        id: request.id,
        date: request.createdAt,
        owner: request.entity?.type === 'NATURAL' 
          ? `${request.entity.firstName} ${request.entity.paternalSurname}`.trim()
          : request.entity?.businessName || 'N/A',
        dni: request.entity?.documentNumber || 'N/A',
        fullname: mainPerson ? mainPerson.fullname : 'N/A',
        status: request.status,
        documents: completeDocs
      };
    });

    return {
      requests: transformedRequests,
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