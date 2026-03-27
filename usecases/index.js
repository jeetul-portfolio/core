
const buildSampleUsecase = require('./sample');
const buildGitUsecase = require('./git');
const buildArticlesUsecase = require('./articles');
const buildAuthUsecase = require('./auth');
const buildUsersUsecase = require('./users');
const buildRolesUsecase = require('./roles');
const buildProfileUsecase = require('./profile');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { AuthenticationError, ForbiddenError } = require('../exceptions');

module.exports = function(dependencies) {
  return {
    sampleUsecase: {
      getSampleData: buildSampleUsecase(dependencies),
    },
    gitUsecase: buildGitUsecase(dependencies),
    articlesUsecase: buildArticlesUsecase(dependencies),
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
    profileUsecase: buildProfileUsecase(dependencies),
  };
};

