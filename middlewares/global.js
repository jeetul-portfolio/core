function makeGlobalMiddleware({ crypto, logger }) {
  return function globalMiddleware(req, res, next) {
    const traceId = crypto.randomUUID();
    logger.runWithTraceId(traceId, () => {
      logger.info(`${req.method} ${req.url}`);
      next();
    });
  };
}

module.exports = makeGlobalMiddleware;
