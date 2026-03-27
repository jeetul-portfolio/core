
const express = require('express');
const config = require('./config/index.js');
const logger = require('./utils/logger');
const buildDataAccess = require('./data-access');
const buildUsecases = require('./usecases');
const buildControllers = require('./controllers');
const buildRoutes = require('./routes');
const middlewares = require('./middlewares')
const routeRegistry = require('./route-registry');
const jwt = require('jsonwebtoken');
const makeAuthenticateMiddleware = require('./middlewares/authenticate');
const makeAuthorizeMiddleware = require('./middlewares/authorize');
const { AuthenticationError, ForbiddenError } = require('./exceptions');

// Create instances of dependencies
const dataAccess = buildDataAccess({ config, logger });
const usecase = buildUsecases({ dataAccess, config, logger });
const controller = buildControllers({ usecase, config, logger });
const authMiddlewares = {
  authenticate: makeAuthenticateMiddleware({
    jwt,
    config,
    AuthenticationError,
    dataAccess,
  }),
  authorize: makeAuthorizeMiddleware({
    ForbiddenError,
  }),
};

const routes = buildRoutes({
  controller,
  express,
  middlewares: authMiddlewares,
});
const registry = routeRegistry({ routes, express, config });

module.exports = {
  dataAccess,
  usecase,
  controller,
  routes,
  globalMiddleware: middlewares.global,
  responseTimeMiddleware: middlewares.responseTime,
  routeNotFoundMiddleware: middlewares.routeNotFound,
  registry,
};
