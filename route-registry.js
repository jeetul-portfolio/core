
function routeRegistry({ routes, express, config }) {
  const router = express.Router();

  // Health check route
  router.get('/health', (req, res) => {
    res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString()
    });
  });

  // Iterate over all route modules injected and mount them under /api
  Object.values(routes).forEach((route) => {
    if (typeof route === 'function') {
      router.use(`/apis/${config.serviceName}`, route);
    }
  });

  return router;
}

module.exports = routeRegistry;
