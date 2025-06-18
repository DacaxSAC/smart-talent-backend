require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const swaggerUI = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const { sequelize, testConnection } = require('./config/database');

// Importar rutas
const { userRoutes } = require('./routes/user.routes');
const { authRoutes } = require('./routes/auth.routes');
const { roleRoutes } = require('./routes/role.routes');
const { entityRoutes } = require('./routes/entity.routes');
const { requestRoutes } = require('./routes/request.routes');
const { uploadRoutes } = require('./routes/upload.routes');
const { documentTypeRoutes } = require('./routes/documentType.routes');
const { documentRoutes } = require('./routes/document.routes');

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
    'https://front-smart-talent.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-access-token', 'Origin', 'Accept'],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
}));
app.use(helmet());
app.use(morgan('dev'));

// Configuración de rutas
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/entities', entityRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/document-types', documentTypeRoutes);
app.use('/api/documents', documentRoutes);

// Documentación Swagger
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec));

// Ruta de prueba
app.get('/', (req, res) => {
  res.redirect('/api-docs');
});

// Conexión a la base de datos
const connectDB = async () => {
  try {
    // Sincronizar modelos con la base de datos
    await sequelize.sync({ alter: true });
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
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  await connectDB();
  console.log(`Accede a la API: http://localhost:${PORT}`);
});