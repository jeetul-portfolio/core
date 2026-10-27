const makeGetArticlesController = require('./get-articles');
const makeGetArticleByIdController = require('./get-article-by-id');
const makeGetArticleBySlugController = require('./get-article-by-slug');
const makeCreateArticleController = require('./create-article');
const makeUpdateArticleController = require('./update-article');
const makeDeleteArticleController = require('./delete-article');
const makePublishArticleController = require('./publish-article');
const makeAddArticleCategoriesController = require('./add-article-categories');
const makeRemoveArticleCategoryController = require('./remove-article-category');
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
    getArticleBySlug: makeGetArticleBySlugController(controllerDependencies),
    createArticle: makeCreateArticleController(controllerDependencies),
    updateArticle: makeUpdateArticleController(controllerDependencies),
    deleteArticle: makeDeleteArticleController(controllerDependencies),
    publishArticle: makePublishArticleController(controllerDependencies),
    addArticleCategories: makeAddArticleCategoriesController(controllerDependencies),
    removeArticleCategory: makeRemoveArticleCategoryController(controllerDependencies),
  };
};
