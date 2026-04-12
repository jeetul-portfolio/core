const makeInsertReferences = require('./insert-references');
const makeGetReferencesForSkillIds = require('./get-references-for-skill-ids');
const makeDeleteBySkillId = require('./delete-by-skill-id');

const TABLE_NAME = 'skill_references';

module.exports = function buildSkillReferencesDataAccess(dependencies) {
  const insertReferences = makeInsertReferences({ ...dependencies, tableName: TABLE_NAME });
  const getReferencesForSkillIds = makeGetReferencesForSkillIds({ ...dependencies, tableName: TABLE_NAME });
  const deleteBySkillId = makeDeleteBySkillId({ ...dependencies, tableName: TABLE_NAME });

  return {
    insertReferences,
    getReferencesForSkillIds,
    deleteBySkillId,
  };
};
