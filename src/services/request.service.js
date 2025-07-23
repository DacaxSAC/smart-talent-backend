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
              const document = await Document.create(
                {
                  documentTypeId: docData.documentTypeId,
                  status: "Pendiente",
                  personId: person.id,
                },
                { transaction: t }
              );

              // Crear recursos para este documento
              const createdResources = await Promise.all(
                (docData.resources || []).map(async (resourceData) => {
                  return await Resource.create(
                    {
                      resourceTypeId: resourceData.resourceTypeId,
                      documentId: document.id,
                    },
                    { transaction: t }
                  );
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

    // Get all people and calculate their status
    const people = requests.reduce((acc, request) => {
      const persons = request.persons || [];
      return acc.concat(
        persons.map((person) => {
          const documents = person.documents || [];
          let status = "PENDING";

          const hasCompletedDocs = documents.some(
            (doc) => doc.status === "Realizado"
          );
          const hasPendingDocs = documents.some(
            (doc) => doc.status !== "Realizado"
          );

          if (hasCompletedDocs && hasPendingDocs) {
            status = "IN_PROGRESS";
          } else if (!hasPendingDocs && documents.length > 0) {
            status = "COMPLETED";
          }

          return {
            ...person.toJSON(),
            status,
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
        [
          sequelize.literal(`
            CASE 
              WHEN "request->entity"."type" = 'JURIDICA' THEN "request->entity"."businessName"
              ELSE CONCAT("request->entity"."firstName", ' ', "request->entity"."paternalSurname", ' ', "request->entity"."maternalSurname")
            END
          `),
          "owner",
        ],
        [
          sequelize.literal(`
            CASE
              WHEN EXISTS (
                SELECT 1 FROM "Documents" d 
                WHERE d."personId" = "Person"."id" 
                AND d."status" = 'Realizado'
              ) AND EXISTS (
                SELECT 1 FROM "Documents" d 
                WHERE d."personId" = "Person"."id" 
                AND d."status" != 'Realizado'
              ) THEN 'IN_PROGRESS'
              WHEN NOT EXISTS (
                SELECT 1 FROM "Documents" d 
                WHERE d."personId" = "Person"."id" 
                AND d."status" != 'Realizado'
              ) THEN 'COMPLETED'
              ELSE 'PENDING'
            END
          `),
          "status",
        ],
      ],
    });

    return {
      message: "Personas obtenidas exitosamente",
      people,
    };
  },
};

module.exports = RequestService;
