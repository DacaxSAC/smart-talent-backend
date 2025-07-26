const swaggerJSDoc = require('swagger-jsdoc');

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Smart Talent API',
    version: '1.0.0',
    description: 'API para gestión de usuarios, roles y permisos',
    contact: {
      name: 'Smart Talent Team',
      url: 'https://github.com/charlescastillo/002-smart-talent-api'
    },
  },
  servers: [
    {
      url: 'https://smart-talent-api-4d1h.onrender.com/api/v1',
      description: 'Servidor de producción',
    },
    {
      url: 'http://localhost:3000/api/v1',
      description: 'Servidor de desarrollo',
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
};

const options = {
  swaggerDefinition,
  apis: ['./src/routes/*.js'], // Rutas donde buscar anotaciones de Swagger
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;