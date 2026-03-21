function makeResponseTimeMiddleware() {
  return function responseTimeMiddleware(req, res, next) {
    const start = Date.now();
    const startTimeString = new Date(start).toISOString();

    // Intercept res.send (which is used by res.json under the hood in Express)
    const originalSend = res.send;
    res.send = function (body) {
      if (!res.headersSent) {
        const end = Date.now();
        res.setHeader('x-start-time', startTimeString);
        res.setHeader('x-end-time', new Date(end).toISOString());
        res.setHeader('x-response-time', `${end - start}ms`);
      }
      
      return originalSend.call(this, body);
    };

    next();
  };
}

module.exports = makeResponseTimeMiddleware;