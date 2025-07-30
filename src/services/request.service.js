const {
  Request,
  Person,
  Document,
  Resource,
  Entity,
  ResourceType,
  User,
  Role,
} = require("../models");
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
                  name: docData.name,
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
                      name: resourceData.name,
                      value: resourceData.value,
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
              order: [['id', 'ASC']],
              include: [
                {
                  model: Resource,
                  as: "resources",
                  order: [['id', 'ASC']],
                  attributes: [
                    "id",
                    "name",
                    "value",
                    "documentId",
                    [
                      sequelize.literal(
                        '"persons->documents->resources->resourceType"."allowedFileTypes"'
                      ),
                      "allowedFileTypes",
                    ],
                  ],
                  include: [
                    {
                      model: ResourceType,
                      as: "resourceType",
                      attributes: [],
                    },
                  ],
                },
              ],
            },
            {
              model: User,
              attributes: ["id", "username", "email"],
              through: { attributes: [] },
              required: false,
              include: [
                {
                  model: Role,
                  attributes: ["name"],
                  where: { name: "RECRUITER" },
                  through: { attributes: [] },
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

  async getAllPeopleWithEntities(status = null, recruiterId = null) {
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
  
    // Configurar include para User (reclutador)
    const userInclude = {
      model: User,
      attributes: ["id", "username", "email"],
      through: { attributes: [] },
      required: recruiterId ? true : false, // Si se filtra por reclutador, hacer required
      include: [
        {
          model: Role,
          attributes: ["name"],
          where: { name: "RECRUITER" },
          through: { attributes: [] },
        },
      ],
    };
  
    // Si se especifica recruiterId, agregar filtro
    if (recruiterId) {
      userInclude.where = { id: recruiterId };
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
          order: [['id', 'ASC']], // Agregar ordenamiento por id
          include: [
            {
              model: Resource,
              as: "resources",
              order: [['id', 'ASC']], // Agregar ordenamiento por id
              attributes: [
                "id",
                "name",
                "value",
                "documentId",
                [
                  sequelize.literal(
                    '"documents->resources->resourceType"."allowedFileTypes"'
                  ),
                  "allowedFileTypes",
                ],
              ],
              include: [
                {
                  model: ResourceType,
                  as: "resourceType",
                  attributes: [],
                },
              ],
            },
          ],
        },
        userInclude,
      ],
      order: [['id', 'ASC']], // Agregar ordenamiento principal por id
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
        ],
      ],
    });
  
    return {
      message: "Personas obtenidas exitosamente",
      people,
    };
  },

  /**
   * Obtiene una persona específica por ID con todas sus relaciones
   * @param {number} personId - ID de la persona
   * @returns {Object} Persona con sus relaciones
   */
  async getPersonById(personId) {
    const person = await Person.findByPk(personId, {
      include: [
        {
          model: Request,
          as: "request",
          attributes: [],
          include: [
            {
              model: Entity,
              as: "entity",
              attributes: [],
            },
          ],
        },
        {
          model: Document,
          as: "documents",
          order: [['id', 'ASC']], // Agregar ordenamiento por id
          include: [
            {
              model: Resource,
              as: "resources",
              order: [['id', 'ASC']], // Agregar ordenamiento por id
              attributes: [
                "id",
                "name",
                "value",
                "documentId",
                [
                  sequelize.literal(
                    '"documents->resources->resourceType"."allowedFileTypes"'
                  ),
                  "allowedFileTypes",
                ],
              ],
              include: [
                {
                  model: ResourceType,
                  as: "resourceType",
                  attributes: [],
                },
              ],
            },
          ],
        },
        {
          model: User,
          attributes: ["id", "username", "email"],
          through: { attributes: [] },
          required: false,
          include: [
            {
              model: Role,
              attributes: ["name"],
              where: { name: "RECRUITER" },
              through: { attributes: [] },
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
        ],
      ],
    });

    if (!person) {
      throw new Error("Persona no encontrada");
    }

    // Remover el objeto request de la respuesta pero mantener el campo owner calculado
    const personData = person.toJSON();
    delete personData.request;

    return {
      message: "Persona obtenida exitosamente",
      person: personData,
    };
  },

  async assignRecruiter(recruiterId, personId) {
    const t = await sequelize.transaction();

    try {
      // Verificar que la persona existe y obtener su solicitud
      const { User, Role, Person } = require("../models");
      const person = await Person.findByPk(personId, {
        include: [
          {
            model: Request,
            as: "request",
          },
        ],
        transaction: t,
      });

      if (!person) {
        await t.rollback();
        throw new Error("Persona no encontrada");
      }

      // Verificar que el usuario existe y es un recruiter
      const recruiter = await User.findByPk(recruiterId, {
        include: [
          {
            model: Role,
            through: { attributes: [] },
            where: { name: "RECRUITER" },
          },
        ],
        transaction: t,
      });

      if (!recruiter) {
        await t.rollback();
        throw new Error("Usuario no encontrado o no es un recruiter");
      }

      // Actualizar el estado de la solicitud a IN_PROGRESS
      await Person.update(
        { status: "IN_PROGRESS" },
        {
          where: { id: person.id },
          transaction: t,
        }
      );

      // Asignar el recruiter a la persona específica (relación User-Person)
      await person.addUser(recruiter, { transaction: t });

      await t.commit();

      return {
        message: "Persona asignada al reclutador",
        requestId: person.request.id,
        personId,
        recruiterId,
        recruiterName: recruiter.name,
        newStatus: "IN_PROGRESS",
      };
    } catch (error) {
      await t.rollback();
      throw error;
    }
  },

  async giveObservations(personId, observations) {
    const t = await sequelize.transaction();

    try {
      // Verificar que la persona existe
      const person = await Person.findByPk(personId, {
        include: [
          {
            model: Request,
            as: "request",
          },
        ],
        transaction: t,
      });

      if (!person) {
        await t.rollback();
        throw new Error("Persona no encontrada");
      }

      // Actualizar observaciones y estado de la persona específica
      await Person.update(
        {
          observations: observations,
          status: "OBSERVED",
        },
        {
          where: { id: personId },
          transaction: t,
        }
      );

      await t.commit();

      return {
        message: "Observaciones agregadas exitosamente a la persona",
        personId,
        observations,
        personUpdated: {
          id: person.id,
          fullname: person.fullname,
          observations: observations,
          status: "OBSERVED",
        },
        requestId: person.request ? person.request.id : null,
      };
    } catch (error) {
      await t.rollback();
      throw error;
    }
  },

  async updatePersonStatus(personId, newStatus) {
    // Primero verificar que la persona existe sin transacción
    const person = await Person.findByPk(personId);
    console.log('Person found:', person);
    console.log('PersonId received:', personId, 'Type:', typeof personId);

    if (!person) {
      throw new Error("Persona no encontrada");
    }

    // Ahora usar transacción para la actualización
    const t = await sequelize.transaction();

    try {
      // Actualizar solo el estado de la persona
      await Person.update(
        { status: newStatus },
        {
          where: { id: personId },
          transaction: t,
        }
      );

      await t.commit();

      return {
        message: `Estado de persona actualizado a ${newStatus}`,
        personId,
        newStatus,
        personUpdated: {
          id: person.id,
          fullname: person.fullname,
          status: newStatus,
        },
      };
    } catch (error) {
      // Solo hacer rollback si la transacción no ha sido finalizada
      if (!t.finished) {
        await t.rollback();
      }
      throw error;
    }
  },

  /**
   * Elimina una solicitud y todas sus relaciones asociadas
   * Solo permite eliminar solicitudes en estado PENDING
   * @param {number} requestId - ID de la solicitud a eliminar
   * @returns {Object} Resultado de la eliminación
   */
  async deleteRequest(requestId) {
    const t = await sequelize.transaction();

    try {
      // Verificar que la solicitud existe
      const request = await Request.findByPk(requestId, {
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
        transaction: t,
      });

      if (!request) {
        await t.rollback();
        throw new Error("Solicitud no encontrada");
      }

      // Verificar que el estado sea PENDING
      if (request.status !== "PENDING") {
        await t.rollback();
        throw new Error(
          `No se puede eliminar la solicitud. Estado actual: ${request.status}. Solo se pueden eliminar solicitudes en estado PENDING.`
        );
      }

      // Contar elementos que se van a eliminar para el reporte
      const personsCount = request.persons ? request.persons.length : 0;
      const documentsCount = request.persons
        ? request.persons.reduce(
          (acc, person) =>
            acc + (person.documents ? person.documents.length : 0),
          0
        )
        : 0;
      const resourcesCount = request.persons
        ? request.persons.reduce(
          (acc, person) =>
            acc +
            (person.documents
              ? person.documents.reduce(
                (docAcc, doc) =>
                  docAcc + (doc.resources ? doc.resources.length : 0),
                0
              )
              : 0),
          0
        )
        : 0;

      // Eliminar en orden: Resources -> Documents -> Persons -> Request
      // Las eliminaciones en cascada deberían manejar esto automáticamente,
      // pero lo hacemos explícitamente para mayor control

      for (const person of request.persons || []) {
        for (const document of person.documents || []) {
          // Eliminar recursos del documento
          await Resource.destroy({
            where: { documentId: document.id },
            transaction: t,
          });
        }

        // Eliminar documentos de la persona
        await Document.destroy({
          where: { personId: person.id },
          transaction: t,
        });

        // Eliminar relaciones User-Person si existen
        await sequelize.query(
          'DELETE FROM "UserPeople" WHERE "PersonId" = :personId',
          {
            replacements: { personId: person.id },
            transaction: t,
          }
        );
      }

      // Eliminar personas
      await Person.destroy({
        where: { requestId: request.id },
        transaction: t,
      });

      // Finalmente eliminar la solicitud
      await Request.destroy({
        where: { id: requestId },
        transaction: t,
      });

      await t.commit();

      return {
        message: "Solicitud eliminada exitosamente",
        deletedRequest: {
          id: request.id,
          entityId: request.entityId,
          status: request.status,
          personsDeleted: personsCount,
          documentsDeleted: documentsCount,
          resourcesDeleted: resourcesCount,
        },
      };
    } catch (error) {
      await t.rollback();
      throw error;
    }
  },
};

module.exports = RequestService;
