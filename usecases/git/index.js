const makeGetGitProjectsOverviewUsecase = require('./get-git-projects-overview');
const makeGetGitProjectsOverviewPaginationMetadataUsecase = require('./get-git-projects-overview-pagination-metadata');
const makeSyncGitDataUsecase = require('./sync-git-data');
const buildGithubExternalCalls = require('../../external-calls/github');
const Joi = require('joi');
const { ValidationError } = require('../../exceptions');

module.exports = function buildGitUsecase(dependencies) {
  const usecaseDependencies = {
    ...dependencies,
    Joi,
    ValidationError,
    buildGithubExternalCalls,
  };

  return {
    getGitProjectsOverview: makeGetGitProjectsOverviewUsecase(usecaseDependencies),
    getGitProjectsOverviewPaginationMetadata: makeGetGitProjectsOverviewPaginationMetadataUsecase(usecaseDependencies),
    syncGitData: makeSyncGitDataUsecase(usecaseDependencies),
  };
};