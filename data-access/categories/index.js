const makeGetCategories = require('./get-categories');
const makeGetCategoryById = require('./get-category-by-id');
const makeGetCategoriesByIds = require('./get-categories-by-ids');
const makeCreateCategory = require('./create-category');
const makeUpdateCategory = require('./update-category');
const makeDeleteCategory = require('./delete-category');

const TABLE_NAME = 'categories';

module.exports = function buildCategoriesDataAccess(dependencies) {
  const getCategories = makeGetCategories({ ...dependencies, tableName: TABLE_NAME });
  const getCategoryById = makeGetCategoryById({ ...dependencies, tableName: TABLE_NAME });
  const getCategoriesByIds = makeGetCategoriesByIds({ ...dependencies, tableName: TABLE_NAME });
  const createCategory = makeCreateCategory({ ...dependencies, tableName: TABLE_NAME });
  const updateCategory = makeUpdateCategory({ ...dependencies, tableName: TABLE_NAME });
  const deleteCategory = makeDeleteCategory({ ...dependencies, tableName: TABLE_NAME });

  return {
    getCategories,
    getCategoryById,
    getCategoriesByIds,
    createCategory,
    updateCategory,
    deleteCategory,
  };
};
