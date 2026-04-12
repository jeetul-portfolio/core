const makeInsertCategoryLinks = require('./insert-category-links');
const makeGetCategoryLinksForSkillIds = require('./get-category-links-for-skill-ids');
const makeGetLinksForCategoryIds = require('./get-links-for-category-ids');
const makeDeleteBySkillId = require('./delete-by-skill-id');

const TABLE_NAME = 'skill_categories';

module.exports = function buildSkillCategoriesDataAccess(dependencies) {
  const insertCategoryLinks = makeInsertCategoryLinks({ ...dependencies, tableName: TABLE_NAME });
  const getCategoryLinksForSkillIds = makeGetCategoryLinksForSkillIds({ ...dependencies, tableName: TABLE_NAME });
  const getLinksForCategoryIds = makeGetLinksForCategoryIds({ ...dependencies, tableName: TABLE_NAME });
  const deleteBySkillId = makeDeleteBySkillId({ ...dependencies, tableName: TABLE_NAME });

  return {
    insertCategoryLinks,
    getCategoryLinksForSkillIds,
    getLinksForCategoryIds,
    deleteBySkillId,
  };
};
