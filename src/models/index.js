const { sequelize } = require('../config/database');

// Importar definiciones de modelos
const UserModel = require('./user.model');
const RoleModel = require('./role.model');
const EntityModel = require('./entity.model');
const RequestModel = require('./request.model');
const PersonModel = require('./person.model');
const DocumentModel = require('./document.model');
const ResourceModel = require('./resource.model');
const DocumentTypeModel = require('./documentType.model');
const ResourceTypeModel = require('./resourceType.model');

// Inicializar modelos
const User = UserModel(sequelize);
const Role = RoleModel(sequelize);
const Entity = EntityModel(sequelize);
const Request = RequestModel(sequelize);
const Person = PersonModel(sequelize);
const Document = DocumentModel(sequelize);
const Resource = ResourceModel(sequelize);
const DocumentType = DocumentTypeModel(sequelize);
const ResourceType = ResourceTypeModel(sequelize);

// Definir relaciones
User.belongsToMany(Role, { through: 'UserRoles' });
Role.belongsToMany(User, { through: 'UserRoles' });

Entity.hasOne(User, { foreignKey: 'entityId', as: 'user'});
User.belongsTo(Entity, { foreignKey: 'entityId', as: 'entity' });

Entity.hasMany(Request, { foreignKey: 'entityId', as: 'requests' });
Request.belongsTo(Entity, { foreignKey: 'entityId', as: 'entity' });

Request.hasMany(Person, { foreignKey: 'requestId', as: 'persons' });
Person.belongsTo(Request, { foreignKey: 'requestId', as: 'request' });

Person.hasMany(Document, { foreignKey: 'personId', as: 'documents' });
Document.belongsTo(Person, { foreignKey: 'personId', as: 'person'});

Document.hasMany(Resource, { foreignKey: 'documentId', as: 'resources'});
Resource.belongsTo(Document, { foreignKey: 'documentId', as: 'document' });

DocumentType.hasMany(Document, { foreignKey: 'documentTypeId', as: 'documents' });
Document.belongsTo(DocumentType, { foreignKey: 'documentTypeId', as: 'documentType' });

// Relación muchos a muchos entre DocumentType y ResourceType
DocumentType.belongsToMany(ResourceType, { 
  through: 'DocumentTypeResources',
  as: 'resourceTypes'
});
ResourceType.belongsToMany(DocumentType, { 
  through: 'DocumentTypeResources',
  as: 'documentTypes'
});

module.exports = {
  sequelize,
  User,
  Role,
  Entity,
  Request,
  Person,
  Document,
  Resource,
  DocumentType,
  ResourceType
};