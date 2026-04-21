const makeGetTagsController = require('./get-tags');
const makeGetTagByIdController = require('./get-tag-by-id');
const makeCreateTagController = require('./create-tag');
const makeUpdateTagController = require('./update-tag');
const makeDeleteTagController = require('./delete-tag');
const makeGetTagGraphController = require('./get-tag-graph');
const makeGetSeoTagsController = require('./get-seo-tags');
const Joi = require('joi');
const { ValidationError } = require('../../exceptions');

module.exports = function buildTagsController(dependencies) {
  const controllerDependencies = {
    ...dependencies,
    Joi,
    ValidationError,
  };

  return {
    getTags: makeGetTagsController(controllerDependencies),
    getTagById: makeGetTagByIdController(controllerDependencies),
    createTag: makeCreateTagController(controllerDependencies),
    updateTag: makeUpdateTagController(controllerDependencies),
    deleteTag: makeDeleteTagController(controllerDependencies),
    getTagGraph: makeGetTagGraphController(controllerDependencies),
    getSeoTags: makeGetSeoTagsController(controllerDependencies),
  };
};
