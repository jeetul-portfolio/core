
const sampleRoutes = require('./sample-routes');

function buildRoutes({ controller, express }) {
  const routes = sampleRoutes({ controller, router: express.Router() });

  return {
    routes,
  };
}

module.exports = buildRoutes;
