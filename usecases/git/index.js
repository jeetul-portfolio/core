const makeGetGitProjectsOverviewUsecase = require('./get-git-projects-overview');
const makeGetGitProjectsOverviewPaginationMetadataUsecase = require('./get-git-projects-overview-pagination-metadata');
const makeSyncGitDataUsecase = require('./sync-git-data');
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
    getGitProjectsOverviewPaginationMetadata: makeGetGitProjectsOverviewPaginationMetadataUsecase(usecaseDependencies),
    syncGitData: makeSyncGitDataUsecase(usecaseDependencies),
  };
};