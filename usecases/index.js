
const buildSampleUsecase = require('./sample');
const buildGitUsecase = require('./git');
const buildArticlesUsecase = require('./articles');
const buildAuthUsecase = require('./auth');
const buildUsersUsecase = require('./users');
const buildRolesUsecase = require('./roles');
const buildProfileUsecase = require('./profile');
const buildSkillsUsecase = require('./skills');
const buildCategoriesUsecase = require('./categories');
const buildTagsUsecase = require('./tags');
const buildUserPreferencesUsecase = require('./user-preferences');
const buildResumesUsecase = require('./resumes');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { AuthenticationError, ForbiddenError } = require('../exceptions');

module.exports = function(dependencies) {
  // Build tags usecase first so syncEntityTags can be injected into other usecases
  const tagsUsecase = buildTagsUsecase(dependencies);
  const { syncEntityTags } = tagsUsecase;
  const depsWithSync = { ...dependencies, syncEntityTags };

  return {
    sampleUsecase: {
      getSampleData: buildSampleUsecase(dependencies),
    },
    gitUsecase: buildGitUsecase(dependencies),
    articlesUsecase: buildArticlesUsecase(depsWithSync),
    authUsecase: buildAuthUsecase({
      ...dependencies,
      jwt,
      bcrypt,
      crypto,
      AuthenticationError,
      ForbiddenError,
    }),
    usersUsecase: buildUsersUsecase(dependencies),
    rolesUsecase: buildRolesUsecase(dependencies),
    profileUsecase: buildProfileUsecase(depsWithSync),
    skillsUsecase: buildSkillsUsecase(depsWithSync),
    categoriesUsecase: buildCategoriesUsecase(dependencies),
    tagsUsecase,
    userPreferencesUsecase: buildUserPreferencesUsecase(dependencies),
    resumesUsecase: buildResumesUsecase(dependencies),
  };
};

