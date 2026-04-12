const makeGetCategoriesUsecase = require('./get-categories');
const makeGetCategoryByIdUsecase = require('./get-category-by-id');
const makeCreateCategoryUsecase = require('./create-category');
const makeUpdateCategoryUsecase = require('./update-category');
const makeDeleteCategoryUsecase = require('./delete-category');
const { NotFoundError } = require('../../exceptions');
const { presentCategory } = require('./category-presenter');

module.exports = function buildCategoriesUsecase(dependencies) {
  const baseDependencies = {
    ...dependencies,
    presentCategory,
    NotFoundError,
  };

  const getCategoryById = makeGetCategoryByIdUsecase(baseDependencies);

  const usecaseDependencies = {
    ...baseDependencies,
    getCategoryById,
  };

  return {
    getCategories: makeGetCategoriesUsecase(usecaseDependencies),
    getCategoryById,
    createCategory: makeCreateCategoryUsecase(usecaseDependencies),
    updateCategory: makeUpdateCategoryUsecase(usecaseDependencies),
    deleteCategory: makeDeleteCategoryUsecase(usecaseDependencies),
  };
};
