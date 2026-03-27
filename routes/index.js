
const sampleRoutes = require('./sample-routes');
const gitRoutes = require('./git-routes');
const articlesRoutes = require('./articles-routes');
const authRoutes = require('./auth-routes');
const usersRoutes = require('./users-routes');
const rolesRoutes = require('./roles-routes');
const profileRoutes = require('./profile-routes');

function buildRoutes({ controller, express, middlewares }) {
  const sample = sampleRoutes({ controller, router: express.Router(), middlewares });
  const git = gitRoutes({ controller, router: express.Router(), middlewares });
  const articles = articlesRoutes({ controller, router: express.Router(), middlewares });
  const auth = authRoutes({ controller, router: express.Router(), middlewares });
  const users = usersRoutes({ controller, router: express.Router(), middlewares });
  const roles = rolesRoutes({ controller, router: express.Router(), middlewares });
  const profile = profileRoutes({ controller, router: express.Router(), middlewares });

  return {
    sample,
    git,
    articles,
    auth,
    users,
    roles,
    profile,
  };
}

module.exports = buildRoutes;
