
const buildSampleController = require('./sample');
const buildGitController = require('./git');
const buildArticlesController = require('./articles');
const buildAuthController = require('./auth');
const buildUsersController = require('./users');
const buildRolesController = require('./roles');
const buildProfileController = require('./profile');
const buildSkillsController = require('./skills');
const buildCategoriesController = require('./categories');
const buildTagsController = require('./tags');
const buildUserPreferencesController = require('./user-preferences');
const { formatResponse, formatError } = require('./response-formatter');

module.exports = function(dependencies) {
  const controllerDependencies = {
    ...dependencies,
    formatResponse,
    formatError,
  };

  return {
    sampleController: {
      getSampleData: buildSampleController(controllerDependencies),
    },
    gitController: buildGitController(controllerDependencies),
    articlesController: buildArticlesController(controllerDependencies),
    authController: buildAuthController(controllerDependencies),
    usersController: buildUsersController(controllerDependencies),
    rolesController: buildRolesController(controllerDependencies),
    profileController: buildProfileController(controllerDependencies),
    skillsController: buildSkillsController(controllerDependencies),
    categoriesController: buildCategoriesController(controllerDependencies),
    tagsController: buildTagsController(controllerDependencies),
    userPreferencesController: buildUserPreferencesController(controllerDependencies),
  };
};
