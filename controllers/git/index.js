const makeGetGitProjectsOverviewController = require('./get-git-projects-overview');
const Joi = require('joi');
const { ValidationError } = require('../../exceptions');

module.exports = function buildGitController(dependencies) {
  const controllerDependencies = {
    ...dependencies,
    Joi,
    ValidationError,
  };

  return {
    getGitProjectsOverview: makeGetGitProjectsOverviewController(controllerDependencies),
  };
};