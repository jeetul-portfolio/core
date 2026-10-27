const makeGetCategoriesUsecase = require('./get-categories');
const makeGetCategoryByIdUsecase = require('./get-category-by-id');
const makeCreateCategoryUsecase = require('./create-category');
const makeUpdateCategoryUsecase = require('./update-category');
const makeDeleteCategoryUsecase = require('./delete-category');
const { NotFoundError, ConflictError } = require('../../exceptions');
const { presentCategory } = require('./category-presenter');
const makeResolveSlug = require('../content-records/resolve-slug');
const slugify = require('../content-records/slugify');

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
    resolveCategorySlug: makeResolveSlug({
      store: dependencies.dataAccess.categories,
      entityType: 'category',
      label: 'Category',
      slugify,
      ConflictError,
    }),
  };

  return {
    getCategories: makeGetCategoriesUsecase(usecaseDependencies),
    getCategoryById,
    createCategory: makeCreateCategoryUsecase(usecaseDependencies),
    updateCategory: makeUpdateCategoryUsecase(usecaseDependencies),
    deleteCategory: makeDeleteCategoryUsecase(usecaseDependencies),
  };
};
