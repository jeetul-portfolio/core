const makeGetArticlesController = require('./get-articles');
const makeGetArticleByIdController = require('./get-article-by-id');
const makeCreateArticleController = require('./create-article');
const makeUpdateArticleController = require('./update-article');
const makeDeleteArticleController = require('./delete-article');
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
    createArticle: makeCreateArticleController(controllerDependencies),
    updateArticle: makeUpdateArticleController(controllerDependencies),
    deleteArticle: makeDeleteArticleController(controllerDependencies),
  };
};
