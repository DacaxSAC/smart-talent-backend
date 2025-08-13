require('dotenv').config(); // ✅ Cargar PRIMERO
const { Sequelize } = require('sequelize');
const { DB_CONNECTION_STRING } = require('./env-variable'); // ✅ Ahora sí tendrá el valor

// Configuración de la conexión a PostgreSQL
const sequelize = new Sequelize(DB_CONNECTION_STRING, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
  logging: false,
});

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

// Configuración para sequelize-cli
module.exports = {
  development: {
    url: DB_CONNECTION_STRING,
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
    logging: false,
  },
  production: {
    url: DB_CONNECTION_STRING,
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
    logging: false,
  }
};

// Exportaciones originales para compatibilidad
module.exports.sequelize = sequelize;
module.exports.testConnection = testConnection;