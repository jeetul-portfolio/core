function makeRouteNotFoundMiddleware({ logger }) {
  return function routeNotFound(req, res, next) {
    logger.warn(`No route found for ${req.method} ${req.originalUrl}`);
    // If the request makes it here, no previous routes matched
    res.status(404).json({Data: {
       error: 'routeNotFound',
       message: `No route found for ${req.method} ${req.originalUrl}`,
       code: 404
    }
    });
  };
}

module.exports = makeRouteNotFoundMiddleware;