const crypto = require('crypto');
const logger = require('../utils/logger');

const makeGlobalMiddleware = require('./global.js');
const makeRouteNotFoundMiddleware = require('./route-not-found.js');
const makeResponseTimeMiddleware = require('./response-time.js');

module.exports = {
  global: makeGlobalMiddleware({ crypto, logger }),
  routeNotFound: makeRouteNotFoundMiddleware({ logger }),
  responseTime: makeResponseTimeMiddleware(),
};
