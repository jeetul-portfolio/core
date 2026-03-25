
const sampleRoutes = require('./sample-routes');
const gitRoutes = require('./git-routes');
const articlesRoutes = require('./articles-routes');

function buildRoutes({ controller, express }) {
  const sample = sampleRoutes({ controller, router: express.Router() });
  const git = gitRoutes({ controller, router: express.Router() });
  const articles = articlesRoutes({ controller, router: express.Router() });

  return {
    sample,
    git,
    articles,
  };
}

module.exports = buildRoutes;
