const makeGetTagsUsecase = require('./get-tags');
const makeGetTagByIdUsecase = require('./get-tag-by-id');
const makeCreateTagUsecase = require('./create-tag');
const makeUpdateTagUsecase = require('./update-tag');
const makeDeleteTagUsecase = require('./delete-tag');
const makeGetTagGraphUsecase = require('./get-tag-graph');
const makeSyncEntityTagsUsecase = require('./sync-entity-tags');
const makeGetSeoTagsUsecase = require('./get-seo-tags');
const { NotFoundError } = require('../../exceptions');

module.exports = function buildTagsUsecase(dependencies) {
  const usecaseDeps = { ...dependencies, NotFoundError };

  return {
    getTags: makeGetTagsUsecase(usecaseDeps),
    getTagById: makeGetTagByIdUsecase(usecaseDeps),
    createTag: makeCreateTagUsecase(usecaseDeps),
    updateTag: makeUpdateTagUsecase(usecaseDeps),
    deleteTag: makeDeleteTagUsecase(usecaseDeps),
    getTagGraph: makeGetTagGraphUsecase(usecaseDeps),
    syncEntityTags: makeSyncEntityTagsUsecase(usecaseDeps),
    getSeoTags: makeGetSeoTagsUsecase(usecaseDeps),
  };
};
