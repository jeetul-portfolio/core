const makeInsertReferences = require('./insert-references');
const makeGetReferencesForSkillIds = require('./get-references-for-skill-ids');
const makeDeleteBySkillId = require('./delete-by-skill-id');
const makeGetSkillsForReferences = require('./get-skills-for-references');
const makeReplaceForReference = require('./replace-for-reference');

const TABLE_NAME = 'skill_references';

module.exports = function buildSkillReferencesDataAccess(dependencies) {
  const insertReferences = makeInsertReferences({ ...dependencies, tableName: TABLE_NAME });
  const getReferencesForSkillIds = makeGetReferencesForSkillIds({ ...dependencies, tableName: TABLE_NAME });
  const deleteBySkillId = makeDeleteBySkillId({ ...dependencies, tableName: TABLE_NAME });

  const getSkillsForReferences = makeGetSkillsForReferences({ ...dependencies, tableName: TABLE_NAME });
  const replaceForReference = makeReplaceForReference({ ...dependencies, tableName: TABLE_NAME });

  return {
    insertReferences,
    getReferencesForSkillIds,
    deleteBySkillId,
    getSkillsForReferences,
    replaceForReference,
  };
};
