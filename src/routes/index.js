const express = require('express');
const swaggerUI = require('swagger-ui-express');
const swaggerSpec = require('../config/swagger');
const authRouter = require('./auth.routes');
const billingRouter = require('./billing.routes');
const documentsRouter = require('./document.routes');
const documentTypesRouter = require('./documentType.routes');
const entitiesRouter = require('./entity.routes');
const requestsRouter = require('./request.routes');
const resourcesRouter = require('./resource.routes');
const rolesRouter = require('./role.routes');
const uploadsRouter = require('./upload.routes');
const usersRouter = require('./user.routes');
const recruitmentsRouter = require('./recruitment.routes');

function routerApi(app){
  const router = express.Router();

  app.get('/', (req, res) => {
    res.redirect('/api/v1/api-docs');
  });

  app.use('/api/v1', router);
  router.use('/auth', authRouter);
  router.use('/billing', billingRouter);
  router.use('/roles', rolesRouter);
  router.use('/users', usersRouter);
  router.use('/entities', entitiesRouter);
  router.use('/documents', documentsRouter);
  router.use('/document-types', documentTypesRouter);
  router.use('/requests', requestsRouter);
  router.use('/resources', resourcesRouter);
  router.use('/upload', uploadsRouter);
  router.use('/recruitments', recruitmentsRouter);
  router.use('/api-docs', swaggerUI.serve);  
  router.get('/api-docs', swaggerUI.setup(swaggerSpec));
}


module.exports = routerApi;