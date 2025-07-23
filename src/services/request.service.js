const { Request, Person, Document, Resource, Entity } = require("../models");
const { sequelize } = require("../config/database");
const { Op } = require("sequelize");

const RequestService = {
  async createRequest(data) {
    const t = await sequelize.transaction();

    try {
      const { entityId, people } = data;

      // Verificar que la entidad existe
      const entity = await Entity.findByPk(entityId, { transaction: t });
      if (!entity) {
        await t.rollback();
        throw new Error("Entidad no encontrada");
      }

      // Crear la solicitud
      const request = await Request.create(
        {
          entityId,
          status: "PENDING",
        },
        { transaction: t }
      );

      // Crear las personas y sus documentos/recursos asociados
      const createdPeople = await Promise.all(
        people.map(async (personData) => {
          // Crear persona con los campos actualizados
          const person = await Person.create(
            {
              dni: personData.dni,
              fullname: personData.fullname,
              phone: personData.phone,
              requestId: request.id,
            },
            { transaction: t }
          );

          // Crear documentos para esta persona
          const createdDocuments = await Promise.all(
            (personData.documents || []).map(async (docData) => {
              const document = await Document.create({
                documentTypeId: docData.documentTypeId,
                name: docData.name,
                status: 'Pendiente',
                personId: person.id
              }, { transaction: t });

              // Crear recursos para este documento
              const createdResources = await Promise.all(
                (docData.resources || []).map(async (resourceData) => {
                  return await Resource.create({
                    resourceTypeId: resourceData.resourceTypeId,
                    documentId: document.id,
                    name: resourceData.name,
                    value: resourceData.value
                  }, { transaction: t });
                })
              );

              return {
                ...document.toJSON(),
                resources: createdResources,
              };
            })
          );

          return {
            ...person.toJSON(),
            documents: createdDocuments,
          };
        })
      );

      await t.commit();

      return {
        message: "Solicitud creada exitosamente",
        request: {
          ...request.toJSON(),
          people: createdPeople,
        },
      };
    } catch (error) {
      await t.rollback();
      throw error;
    }
  },

  async getPersonsByEntityId(entityId) {
    // Verificar que la entidad existe
    const entity = await Entity.findByPk(entityId);
    if (!entity) {
      throw new Error("Entidad no encontrada");
    }

    // Obtener todas las solicitudes de la entidad
    const requests = await Request.findAll({
      where: { entityId },
      include: [
        {
          model: Person,
          as: "persons",
          include: [
            {
              model: Document,
              as: "documents",
              include: [
                {
                  model: Resource,
                  as: "resources",
                },
              ],
            },
          ],
        },
      ],
    });

    // Get all people with their actual status
    const people = requests.reduce((acc, request) => {
      const persons = request.persons || [];
      return acc.concat(
        persons.map((person) => {
          return {
            ...person.toJSON(),
          };
        })
      );
    }, []);

    return {
      message: "Personas obtenidas exitosamente",
      people,
    };
  },

  async getAllPeopleWithEntities(status = null) {
    // Construir condiciones de filtro
    const whereConditions = {};
    if (status) {
      // Si status es un array, usar operador IN
      // Si es un string, convertir a array para consistencia
      const statusArray = Array.isArray(status) ? status : [status];
      // En la línea 141, cambiar:
      whereConditions.status =
        statusArray.length === 1 ? statusArray[0] : { [Op.in]: statusArray };
    }

    // Obtener todas las personas con sus relaciones
    const people = await Person.findAll({
      where: whereConditions,
      include: [
        {
          model: Request,
          as: "request",
          include: [
            {
              model: Entity,
              as: "entity",
            },
          ],
        },
        {
          model: Document,
          as: "documents",
          include: [
            {
              model: Resource,
              as: "resources",
            },
          ],
        },
      ],
      attributes: [
        "id",
        "dni",
        "fullname",
        "phone",
        "status",
        "observations",
        [
          sequelize.literal(`
            CASE 
              WHEN "request->entity"."type" = 'JURIDICA' THEN "request->entity"."businessName"
              ELSE CONCAT("request->entity"."firstName", ' ', "request->entity"."paternalSurname", ' ', "request->entity"."maternalSurname")
            END
          `),
          "owner",
        ]
      ],
    });

    return {
      message: "Personas obtenidas exitosamente",
      people,
    };
  },

  async updateRequestStatus(requestId, newStatus) {
    const t = await sequelize.transaction();

    try {
      // Verificar que la solicitud existe
      const request = await Request.findByPk(requestId, { transaction: t });
      if (!request) {
        await t.rollback();
        throw new Error('Solicitud no encontrada');
      }

      // Actualizar el estado de la solicitud
      await Request.update(
        { status: newStatus },
        {
          where: { id: requestId },
          transaction: t
        }
      );

      await t.commit();

      return {
        message: `Estado de solicitud actualizado a ${newStatus}`,
        requestId,
        newStatus
      };
    } catch (error) {
      await t.rollback();
      throw error;
    }
  },

  async moveRequestToInProgress(requestId) {
    return await this.updateRequestStatus(requestId, 'IN_PROGRESS');
  },

  async assignRecruiter(recruiterId, personId) {
    const t = await sequelize.transaction();

    try {
      // Verificar que la persona existe y obtener su solicitud
      const { User, Role, Person } = require('../models');
      const person = await Person.findByPk(personId, {
        include: [{
          model: Request,
          as: 'request'
        }],
        transaction: t
      });

      if (!person) {
        await t.rollback();
        throw new Error('Persona no encontrada');
      }

      // Verificar que el usuario existe y es un recruiter
      const recruiter = await User.findByPk(recruiterId, {
        include: [{
          model: Role,
          through: { attributes: [] },
          where: { name: 'RECRUITER' }
        }],
        transaction: t
      });

      if (!recruiter) {
        await t.rollback();
        throw new Error('Usuario no encontrado o no es un recruiter');
      }

      // Actualizar el estado de la solicitud a IN_PROGRESS
      await Person.update(
        { status: 'IN_PROGRESS' },
        { 
          where: { id: person.id },
          transaction: t 
        }
      );

      // Asignar el recruiter a la persona específica (relación User-Person)
      await person.addUser(recruiter, { transaction: t });

      await t.commit();

      return {
        message: 'Persona asignada al reclutador',
        requestId: person.request.id,
        personId,
        recruiterId,
        recruiterName: recruiter.name,
        newStatus: 'IN_PROGRESS'
      };
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  

};

module.exports = RequestService;
