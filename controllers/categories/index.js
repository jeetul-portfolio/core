const makeGetCategoriesController = require('./get-categories');
const makeGetCategoryByIdController = require('./get-category-by-id');
const makeCreateCategoryController = require('./create-category');
const makeUpdateCategoryController = require('./update-category');
const makeDeleteCategoryController = require('./delete-category');
const Joi = require('joi');
const { ValidationError } = require('../../exceptions');

module.exports = function buildCategoriesController(dependencies) {
  const controllerDependencies = {
    ...dependencies,
    Joi,
    ValidationError,
  };

  return {
    getCategories: makeGetCategoriesController(controllerDependencies),
    getCategoryById: makeGetCategoryByIdController(controllerDependencies),
    createCategory: makeCreateCategoryController(controllerDependencies),
    updateCategory: makeUpdateCategoryController(controllerDependencies),
    deleteCategory: makeDeleteCategoryController(controllerDependencies),
  };
};
