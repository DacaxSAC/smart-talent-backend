const { Request, Person, Document, Resource, Entity } = require('../models');
const { sequelize } = require('../config/database');

const RequestService = {
  /**
   * Crea una nueva solicitud con personas, documentos y recursos
   */
  async createRequest(requestData) {
    const { entityId, people } = requestData;
    const transaction = await sequelize.transaction();

    try {
      // Verificar que la entidad existe
      const entity = await Entity.findByPk(entityId, { transaction });
      if (!entity) {
        throw new Error('Entidad no encontrada');
      }

      // Crear la solicitud
      const request = await Request.create({
        entityId,
        status: 'PENDING'
      }, { transaction });

      // Crear las personas y sus documentos/recursos asociados
      const createdPeople = await Promise.all(people.map(async (personData) => {
        // Crear persona
        const person = await Person.create({
          dni: personData.dni,
          fullname: personData.fullname,
          phone: personData.phone,
          requestId: request.id
        }, { transaction });

        // Crear documentos para esta persona
        const createdDocuments = await Promise.all(
          (personData.documents || []).map(async (docData) => {
            const document = await Document.create({
              documentTypeId: docData.documentTypeId,
              name: docData.name,
              personId: person.id
            }, { transaction });

            // Crear recursos para este documento
            const createdResources = await Promise.all(
              (docData.resources || []).map(resourceData =>
                Resource.create({
                  resourceTypeId: resourceData.resourceTypeId,
                  name: resourceData.name,
                  value: resourceData.value,
                  documentId: document.id
                }, { transaction })
              )
            );

            return {
              ...document.toJSON(),
              resources: createdResources
            };
          })
        );

        return {
          ...person.toJSON(),
          documents: createdDocuments
        };
      }));

      await transaction.commit();

      return {
        ...request.toJSON(),
        people: createdPeople
      };

    } catch (error) {
      await transaction.rollback();
      throw new Error(`Error al crear la solicitud: ${error.message}`);
    }
  },

  /**
   * Obtiene todas las personas de una entidad con su estado calculado
   */
  async getPersonsByEntityId(entityId) {
    // Verificar que la entidad existe
    const entity = await Entity.findByPk(entityId);
    if (!entity) {
      throw new Error('Entidad no encontrada');
    }

    // Obtener todas las solicitudes de la entidad
    const requests = await Request.findAll({
      where: { entityId },
      include: [{
        model: Person,
        as: 'persons',
        include: [{
          model: Document,
          as: 'documents',
          include: [{
            model: Resource,
            as: 'resources'
          }]
        }]
      }]
    });

    // Procesar personas y calcular su estado
    const people = requests.reduce((acc, request) => {
      const persons = request.persons || [];
      return acc.concat(persons.map(person => {
        const documents = person.documents || [];
        const status = this.calculatePersonStatus(documents);
        
        return {
          ...person.toJSON(),
          status
        };
      }));
    }, []);

    return people;
  },

  /**
   * Obtiene todas las personas con información de su entidad
   */
  async getAllPeopleWithEntities() {
    const people = await Person.findAll({
      include: [{
        model: Request,
        as: 'request',
        include: [{
          model: Entity,
          as: 'entity'
        }]
      }, {
        model: Document,
        as: 'documents',
        include: [{
          model: Resource,
          as: 'resources'
        }]
      }],
      attributes: [
        'id',
        'dni', 
        'fullname',
        'phone',
        [
          sequelize.literal(`
            CASE 
              WHEN "request->entity"."type" = 'JURIDICA' THEN "request->entity"."businessName"
              ELSE CONCAT("request->entity"."firstName", ' ', "request->entity"."paternalSurname", ' ', "request->entity"."maternalSurname")
            END
          `),
          'owner'
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
          'status'
        ]
      ]
    });

    return people;
  },

  /**
   * Calcula el estado de una persona basado en sus documentos
   */
  calculatePersonStatus(documents) {
    if (!documents || documents.length === 0) {
      return 'PENDING';
    }

    const hasCompletedDocs = documents.some(doc => doc.status === 'Realizado');
    const hasPendingDocs = documents.some(doc => doc.status !== 'Realizado');
    
    if (hasCompletedDocs && hasPendingDocs) {
      return 'IN_PROGRESS';
    } else if (!hasPendingDocs && documents.length > 0) {
      return 'COMPLETED';
    }
    
    return 'PENDING';
  }
};

module.exports = RequestService;