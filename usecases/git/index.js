const makeGetGitProjectsOverviewUsecase = require('./get-git-projects-overview');
const Joi = require('joi');
const { ValidationError } = require('../../exceptions');

module.exports = function buildGitUsecase(dependencies) {
  const usecaseDependencies = {
    ...dependencies,
    Joi,
    ValidationError,
  };

  return {
    getGitProjectsOverview: makeGetGitProjectsOverviewUsecase(usecaseDependencies),
  };
};