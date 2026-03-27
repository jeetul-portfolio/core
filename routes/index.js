
const sampleRoutes = require('./sample-routes');
const gitRoutes = require('./git-routes');
const articlesRoutes = require('./articles-routes');
const authRoutes = require('./auth-routes');

function buildRoutes({ controller, express, middlewares }) {
  const sample = sampleRoutes({ controller, router: express.Router(), middlewares });
  const git = gitRoutes({ controller, router: express.Router(), middlewares });
  const articles = articlesRoutes({ controller, router: express.Router(), middlewares });
  const auth = authRoutes({ controller, router: express.Router(), middlewares });

  return {
    sample,
    git,
    articles,
    auth,
  };
}

module.exports = buildRoutes;
