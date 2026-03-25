const makeGetArticlesController = require('./get-articles');
const makeGetArticleByIdController = require('./get-article-by-id');
const Joi = require('joi');
const { ValidationError } = require('../../exceptions');

module.exports = function buildArticlesController(dependencies) {
  const controllerDependencies = {
    ...dependencies,
    Joi,
    ValidationError,
  };

  return {
    getArticles: makeGetArticlesController(controllerDependencies),
    getArticleById: makeGetArticleByIdController(controllerDependencies),
  };
};
