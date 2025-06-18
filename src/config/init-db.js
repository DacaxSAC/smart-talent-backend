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
        name: 'MANAGER',
        description: 'Gerente con acceso a gestión y reportes',
        permissions: ['CREATE', 'READ', 'UPDATE']
      },
      {
        name: 'USER',
        description: 'Usuario estándar del sistema',
        permissions: ['READ']
      },
      {
        name: 'GUEST',
        description: 'Usuario invitado con acceso limitado',
        permissions: ['READ']
      }
    ];

    // Insertar roles en la base de datos
    await Role.bulkCreate(roles);
    console.log('Roles predeterminados creados exitosamente');

    // Crear usuarios para cada rol
    const usersData = [
      {
        username: 'admin',
        email: 'admin@smarttalent.com',
        password: 'Admin@123',
        firstName: 'Admin',
        lastName: 'System',
        active: true,
        roleName: 'ADMIN'
      },
      {
        username: 'manager',
        email: 'manager@smarttalent.com',
        password: 'Manager@123',
        firstName: 'Manager',
        lastName: 'System',
        active: true,
        roleName: 'MANAGER'
      },
      {
        username: 'user',
        email: 'user@smarttalent.com',
        password: 'User@123',
        firstName: 'User',
        lastName: 'Standard',
        active: true,
        roleName: 'USER'
      },
      {
        username: 'guest',
        email: 'guest@smarttalent.com',
        password: 'Guest@123',
        firstName: 'Guest',
        lastName: 'Visitor',
        active: true,
        roleName: 'GUEST'
      }
    ];

    // Crear usuarios y asignar roles
    for (const userData of usersData) {
      const { roleName, ...userInfo } = userData;
      const user = await User.create(userInfo);
      const role = await Role.findOne({ where: { name: roleName } });
      await user.addRole(role);
      console.log(`Usuario ${roleName} creado exitosamente`);
      console.log(`Email: ${userInfo.email}`);
      console.log(`Contraseña: ${userInfo.password}`);
      console.log('-------------------');
    }

    // Entidad Natural por defecto
    const entidadNatural = await EntityService.createEntityWithUser({
      type: 'NATURAL',
      documentNumber: '12345678',
      firstName: 'Juan',
      paternalSurname: 'Pérez',
      maternalSurname: 'García',
      address: 'Calle Falsa 123',
      phone: '999888777',
      email: 'natural@prueba.com',
      active: true
    });
    console.log('Entidad NATURAL por defecto creada');

    // Entidad Jurídica por defecto
    const entidadJuridica = await EntityService.createEntityWithUser({
      type: 'JURIDICA',
      documentNumber: '20123456789',
      businessName: 'Empresa Ejemplo SAC',
      address: 'Av. Principal 456',
      phone: '988877766',
      email: 'juridica@prueba.com',
      active: true
    });
    console.log('Entidad JURIDICA por defecto creada');

    // Crear tipos de documentos predeterminados
    const documentTypes = [
      {
        name: 'Antecedentes Nacionales',
        isActive: true
      },
      {
        name: 'Verificación laboral',
        isActive: true
      },
      {
        name: 'Verificación Académica',
        isActive: true
      },
      {
        name: 'Verificación Crediticia',
        isActive: true
      },
      {
        name: 'Verificación Domiciliaria',
        isActive: true
      }
    ];

    // Insertar tipos de documentos
    const createdDocTypes = await DocumentType.bulkCreate(documentTypes);
    console.log('Tipos de documentos creados exitosamente');

    // Crear tipos de recursos
    const resourceTypes = [
      {
        name: 'Documento de Identidad (ejm: DNI)',
        description: 'Documento original escaneado',
        isRequired: true,
        maxFileSize: 500000,
        allowedFileTypes: ['application/pdf', 'image/jpeg', 'image/png']
      },
      {
        name: 'Observaciones',
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

    // Insertar tipos de recursos
    const createdResourceTypes = await ResourceType.bulkCreate(resourceTypes);
    console.log('Tipos de recursos creados exitosamente');

    // Asociar tipos de documentos con tipos de recursos
    const documentResourceAssociations = [
      // Antecedentes Nacionales
      { docType: createdDocTypes[0], resources: [createdResourceTypes[0], createdResourceTypes[1]] },
      // Verificación laboral
      { docType: createdDocTypes[1], resources: [createdResourceTypes[5], createdResourceTypes[1]] },
      // Verificación Académica
      { docType: createdDocTypes[2], resources: [createdResourceTypes[6], createdResourceTypes[1]] },
      // Verificación Crediticia
      { docType: createdDocTypes[3], resources: [createdResourceTypes[1]] },
      // Verificación Domiciliaria
      { docType: createdDocTypes[4], resources: [createdResourceTypes[2], createdResourceTypes[3], createdResourceTypes[4]] }
    ];

    // Crear las asociaciones
    for (const association of documentResourceAssociations) {
      await association.docType.addResourceTypes(association.resources);
    }
    console.log('Asociaciones entre tipos de documentos y recursos creadas exitosamente');
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