const { sequelize, Role, User, DocumentType, ResourceType } = require('../models');
const EntityService = require('../services/entity.service');
require('dotenv').config();

const initDatabase = async () => {
  try {
    await sequelize.sync({ force: true });
    console.log('Conexión a PostgreSQL establecida para inicialización');

    // Crear roles predeterminados
    const roles = [
      {
        name: 'ADMIN',
        description: 'Administrador con acceso completo al sistema',
        permissions: ['CREATE', 'READ', 'UPDATE', 'DELETE']
      },
      {
        name: 'RECRUITER',
        description: 'Gerente con acceso a gestión y reportes',
        permissions: ['CREATE', 'READ', 'UPDATE']
      },
      {
        name: 'USER',
        description: 'Usuario estándar del sistema',
        permissions: ['READ']
      }
    ];

    // Crear roles usando findOrCreate para evitar duplicados
    const createdRoles = [];
    for (const roleData of roles) {
      const [role, created] = await Role.findOrCreate({
        where: { name: roleData.name },
        defaults: roleData
      });
      createdRoles.push(role);
      if (created) {
        console.log(`Rol ${roleData.name} creado exitosamente`);
      } else {
        console.log(`Rol ${roleData.name} ya existe`);
      }
    }
    console.log('Verificación de roles completada');

    // Crear usuarios para cada rol
    const usersData = [
      {
        username: 'admin',
        email: 'admin@smarttalent.com',
        password: 'Admin@123',
        active: true,
        isPrimary: false,
        roleName: 'ADMIN'
      },
      {
        username: 'recruiter',
        email: 'recruiter@smarttalent.com',
        password: 'Recruiter@123',
        active: true,
        isPrimary: false,
        roleName: 'RECRUITER'
      }
    ];

    // Crear usuarios y asignar roles usando findOrCreate
    for (const userData of usersData) {
      const { roleName, ...userInfo } = userData;
      const [user, userCreated] = await User.findOrCreate({
        where: { email: userInfo.email },
        defaults: userInfo
      });
      
      if (userCreated) {
        const role = await Role.findOne({ where: { name: roleName } });
        await user.addRole(role);
        console.log(`Usuario ${roleName} creado exitosamente`);
        console.log(`Email: ${userInfo.email}`);
        console.log(`Contraseña: ${userInfo.password}`);
      } else {
        console.log(`Usuario ${roleName} ya existe`);
        console.log(`Email: ${userInfo.email}`);
      }
      console.log('-------------------');
    }
    // Crear tipos de documentos predeterminados
    const documentTypes = [
      'Antecedentes Nacionales',
      'Verificación laboral',
      'Verificación Académica',
      'Verificación Crediticia',
      'Verificación Domiciliaria'
    ];

    // Insertar tipos de documentos usando findOrCreate
    for (const docTypeName of documentTypes) {
      const [docType, created] = await DocumentType.findOrCreate({
        where: { name: docTypeName },
        defaults: {
          name: docTypeName,
          isActive: true
        }
      });
      console.log(created ? `Tipo de documento '${docTypeName}' creado` : `Tipo de documento '${docTypeName}' ya existe`);
    }
    console.log('Verificación de tipos de documentos completada');

    // Crear tipos de recursos
    const resourceTypes = [
      {
        name: 'Documento de Identidad (DNI, CE, etc.)',
        description: 'Documento original escaneado',
        isRequired: true,
        maxFileSize: 500000,
        allowedFileTypes: ['application/pdf', 'image/jpeg', 'image/png']
      },
      {
        name: 'Comentarios adicionales',
        description: 'Cualquier observación adicional',
        isRequired: false,
        maxFileSize: 0,
        allowedFileTypes: []
      },
      {
        name: 'Ubicación',
        description: 'Coordenadas GPS del lugar de domicilio',
        isRequired: true,
        maxFileSize: 0,
        allowedFileTypes: []
      },

      {
        name: 'Dirección',
        description: 'Dirección domiciliaria del solicitante',
        isRequired: true,
        maxFileSize: 0,
        allowedFileTypes: []
      },

      {
        name: 'Referencia',
        description: 'Alguna referencia adicional',
        isRequired: false,
        maxFileSize: 0,
        allowedFileTypes: []
      },
      {
        name: 'Documento laboral (ejm: CV)',
        description: 'Cualquier documento de trabajo',
        isRequired: true,
        maxFileSize: 500000,
        allowedFileTypes: ['application/pdf', 'image/jpeg', 'image/png']
      },
      {
        name: 'Certificado académico (ejm: Título)',
        description: 'Cualquier certificado académico',
        isRequired: true,
        maxFileSize: 500000,
        allowedFileTypes: ['application/pdf', 'image/jpeg', 'image/png']
      },
    ];

    // Insertar tipos de recursos usando findOrCreate
    const createdResourceTypes = [];
    for (const resourceType of resourceTypes) {
      const [resType, created] = await ResourceType.findOrCreate({
        where: { name: resourceType.name },
        defaults: resourceType
      });
      createdResourceTypes.push(resType);
      console.log(created ? `Tipo de recurso '${resourceType.name}' creado` : `Tipo de recurso '${resourceType.name}' ya existe`);
    }
    console.log('Verificación de tipos de recursos completada');

    // Obtener tipos de documentos para las asociaciones
    const docTypes = await DocumentType.findAll({
      where: {
        name: {
          [sequelize.Sequelize.Op.in]: documentTypes
        }
      }
    });

    // Asociar tipos de documentos con tipos de recursos
    const documentResourceAssociations = [
      // Antecedentes Nacionales
      { docTypeName: 'Antecedentes Nacionales', resourceIndexes: [0, 1] },
      // Verificación laboral
      { docTypeName: 'Verificación laboral', resourceIndexes: [5, 1] },
      // Verificación Académica
      { docTypeName: 'Verificación Académica', resourceIndexes: [6, 1] },
      // Verificación Crediticia
      { docTypeName: 'Verificación Crediticia', resourceIndexes: [1] },
      // Verificación Domiciliaria
      { docTypeName: 'Verificación Domiciliaria', resourceIndexes: [2, 3, 4] }
    ];

    // Crear las asociaciones
    for (const association of documentResourceAssociations) {
      const docType = docTypes.find(dt => dt.name === association.docTypeName);
      if (docType) {
        const resources = association.resourceIndexes.map(index => createdResourceTypes[index]);
        try {
          await docType.addResourceTypes(resources);
          console.log(`Asociaciones creadas para ${association.docTypeName}`);
        } catch (error) {
          // Ignorar errores de asociaciones duplicadas
          console.log(`Asociaciones ya existen para ${association.docTypeName}`);
        }
      }
    }
    console.log('Verificación de asociaciones entre tipos de documentos y recursos completada');
  } catch (error) {
    console.error('Error al inicializar la base de datos:', error);
    process.exit(1);
  }
};

// Ejecutar la inicialización si este archivo se ejecuta directamente
if (require.main === module) {
  initDatabase();
}

module.exports = { initDatabase };