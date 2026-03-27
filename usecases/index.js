
const buildSampleUsecase = require('./sample');
const buildGitUsecase = require('./git');
const buildArticlesUsecase = require('./articles');
const buildAuthUsecase = require('./auth');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

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
    }),
  };
};

