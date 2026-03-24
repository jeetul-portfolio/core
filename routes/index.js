
const sampleRoutes = require('./sample-routes');
const gitRoutes = require('./git-routes');

function buildRoutes({ controller, express }) {
  const sample = sampleRoutes({ controller, router: express.Router() });
  const git = gitRoutes({ controller, router: express.Router() });

  return {
    sample,
    git,
  };
}

module.exports = buildRoutes;
