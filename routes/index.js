
const sampleRoutes = require('./sample-routes');
const gitRoutes = require('./git-routes');
const articlesRoutes = require('./articles-routes');
const authRoutes = require('./auth-routes');
const usersRoutes = require('./users-routes');
const rolesRoutes = require('./roles-routes');
const profileRoutes = require('./profile-routes');
const skillsRoutes = require('./skills-routes');
const categoriesRoutes = require('./categories-routes');
const tagsRoutes = require('./tags-routes');
const userPreferencesRoutes = require('./user-preferences-routes');
const resumesRoutes = require('./resumes-routes');
const oauthClientsRoutes = require('./oauth-clients-routes');
const contentRecordsRoutes = require('./content-records-routes');
const seriesArticlesRoutes = require('./series-articles-routes');

function buildRoutes({ controller, express, middlewares }) {
  const sample = sampleRoutes({ controller, router: express.Router(), middlewares });
  const git = gitRoutes({ controller, router: express.Router(), middlewares });
  const articles = articlesRoutes({ controller, router: express.Router(), middlewares });
  const auth = authRoutes({ controller, router: express.Router(), middlewares });
  const users = usersRoutes({ controller, router: express.Router(), middlewares });
  const roles = rolesRoutes({ controller, router: express.Router(), middlewares });
  const profile = profileRoutes({ controller, router: express.Router(), middlewares });
  const skills = skillsRoutes({ controller, router: express.Router(), middlewares });
  const categories = categoriesRoutes({ controller, router: express.Router(), middlewares });
  const tags = tagsRoutes({ controller, router: express.Router(), middlewares });
  const userPreferences = userPreferencesRoutes({ controller, router: express.Router(), middlewares });
  const resumes = resumesRoutes({ controller, router: express.Router(), middlewares });
  const oauthClients = oauthClientsRoutes({ controller, router: express.Router(), middlewares });
  const experiences = contentRecordsRoutes({
    router: express.Router(),
    middlewares,
    controller: controller.experiencesController,
    resource: 'experiences',
  });
  const projects = contentRecordsRoutes({
    router: express.Router(),
    middlewares,
    controller: controller.projectsController,
    resource: 'projects',
  });
  const series = contentRecordsRoutes({
    router: express.Router(),
    middlewares,
    controller: controller.seriesController,
    resource: 'series',
  });
  const seriesArticles = seriesArticlesRoutes({ controller, router: express.Router(), middlewares });

  return {
    sample,
    git,
    articles,
    auth,
    users,
    roles,
    profile,
    skills,
    categories,
    tags,
    userPreferences,
    resumes,
    oauthClients,
    experiences,
    projects,
    series,
    seriesArticles,
  };
}

module.exports = buildRoutes;
