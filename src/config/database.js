const { Sequelize } = require('sequelize');
const { DB_CONNECTION_STRING } = require('./env-variable');
require('dotenv').config();

// Configuración de la conexión a PostgreSQL
const sequelize = new Sequelize(DB_CONNECTION_STRING, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true, // verificar si es false en caso de error
      rejectUnauthorized: false,
    },
  },
  logging: false,
});

//const sequelize = new Sequelize(DB_CONNECTION_STRING,
//  {
//    host: POSTGRES_HOST,
//    dialect: 'postgres',
//    port: POSTGRES_PORT,
//    dialectOptions: {
//      ssl: {
//        require: false, // Esto es necesario para forzar SSL
//        rejectUnauthorized: false, // Esto puede ser necesario si tu CA no es de confianza
//      },
//    },
//    logging: false,
//  }
//);

// Función para probar la conexión

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexión a PostgreSQL establecida correctamente.');
    return true;
  } catch (error) {
    console.error('Error al conectar a PostgreSQL:', error.message);
    return false;
  }
};

module.exports = {
  sequelize,
  testConnection
};