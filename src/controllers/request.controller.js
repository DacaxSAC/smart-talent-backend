const { Request, Person, Document, Resource, Entity } = require('../models');
const { validationResult } = require('express-validator');
const { sequelize } = require('../config/database');

const RequestController = {
  create: async (req, res) => {
    const t = await sequelize.transaction();

    try {
      // Validar entrada
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { entityId, people } = req.body;

      // Verificar que la entidad existe
      const entity = await Entity.findByPk(entityId, { transaction: t });
      if (!entity) {
        await t.rollback();
        return res.status(404).json({ message: 'Entidad no encontrada' });
      }

      // Crear la solicitud
      const request = await Request.create({
        entityId,
        status: 'PENDING'
      }, { transaction: t });

      // Crear las personas y sus documentos/recursos asociados
      const createdPeople = await Promise.all(people.map(async (personData) => {
        // Crear persona con los campos actualizados
        const person = await Person.create({
          dni: personData.dni,
          fullname: personData.fullname,
          phone: personData.phone,
          requestId: request.id
        }, { transaction: t });

        // Crear documentos para esta persona
        const createdDocuments = await Promise.all(
          (personData.documents || []).map(async (docData) => {
            const document = await Document.create({
              documentTypeId: docData.documentTypeId,
              name: docData.name,
              personId: person.id
            }, { transaction: t });

            // Crear recursos para este documento
            const createdResources = await Promise.all(
              (docData.resources || []).map(resourceData =>
                Resource.create({
                  resourceTypeId: resourceData.resourceTypeId,
                  name: resourceData.name,
                  value: resourceData.value,
                  documentId: document.id
                }, { transaction: t })
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

      await t.commit();

      // Respuesta exitosa
      res.status(201).json({
        message: 'Solicitud creada exitosamente',
        request: {
          ...request.toJSON(),
          people: createdPeople
        }
      });

    } catch (error) {
      await t.rollback();
      console.error('Error al crear solicitud:', error);
      res.status(500).json({ 
        message: 'Error al crear la solicitud', 
        error: error.message 
      });
    }
  },

  // Obtener todas las personas por entityId
  getAllPersonsByEntityId: async (req, res) => {
    try {
      const { entityId } = req.params;

      // Verificar que la entidad existe
      const entity = await Entity.findByPk(entityId);
      if (!entity) {
        return res.status(404).json({ message: 'Entidad no encontrada' });
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

      // Get all people and calculate their status
      const people = requests.reduce((acc, request) => {
        const persons = request.persons || [];
        return acc.concat(persons.map(person => {
          const documents = person.documents || [];
          let status = 'PENDING';
          
          const hasCompletedDocs = documents.some(doc => doc.status === 'Realizado');
          const hasPendingDocs = documents.some(doc => doc.status !== 'Realizado');
          
          if (hasCompletedDocs && hasPendingDocs) {
            status = 'IN_PROGRESS';
          } else if (!hasPendingDocs && documents.length > 0) {
            status = 'COMPLETED';
          }
          
          return {
            ...person.toJSON(),
            status
          };
        }));
      }, []);

      res.status(200).json({
        message: 'Personas obtenidas exitosamente',
        people
      });
    } catch (error) {
      console.error('Error al obtener personas:', error);
      res.status(500).json({ 
        message: 'Error al obtener las personas', 
        error: error.message 
      });
    }
  },

  // Obtener todas las personas con su entidad
  getAllPeople: async (req, res) => {
    try {
      // Obtener todas las personas con sus relaciones
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

      res.status(200).json({
        message: 'Personas obtenidas exitosamente',
        people
      });
    } catch (error) {
      console.error('Error al obtener personas:', error);
      res.status(500).json({ 
        message: 'Error al obtener las personas', 
        error: error.message 
      });
    }
  }
};

module.exports = { RequestController };