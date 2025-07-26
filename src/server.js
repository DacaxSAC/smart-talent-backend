require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const routerApi = require('./routes');
const { sequelize, testConnection } = require('./config/database');
const { SERVER_PORT } = require('./config/env-variable');

// Inicializar la aplicación
const app = express();

// Configuración de middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración de CORS mejorada
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://smart-talent-api-k6yj.onrender.com',
    'https://smart-talent-frontend.vercel.app/',
    'https://smart-talent-api-4d1h.onrender.com',
    'https://smart-talent.netlify.app',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-access-token', 'Origin', 'Accept'],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
}));
app.use(helmet());
app.use(morgan('dev'));

routerApi(app);

// Conexión a la base de datos
const connectDB = async () => {
  try {
    // Sincronizar modelos con la base de datos
    await sequelize.sync();
    // Probar la conexión
    const connected = await testConnection();
    if (!connected) {
      throw new Error('No se pudo establecer conexión con PostgreSQL');
    }
  } catch (error) {
    console.error('Error al conectar a PostgreSQL:', error);
    process.exit(1);
  }
};

// Iniciar el servidor
app.listen(SERVER_PORT, async () => {
  await connectDB();
  console.log(`Accede a la API: http://localhost:${SERVER_PORT}`);
});