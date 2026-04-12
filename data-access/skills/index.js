const makeGetSkills = require('./get-skills');
const makeGetSkillById = require('./get-skill-by-id');
const makeGetSkillsByIds = require('./get-skills-by-ids');
const makeCreateSkill = require('./create-skill');
const makeUpdateSkill = require('./update-skill');
const makeDeleteSkill = require('./delete-skill');

const TABLE_NAME = 'skills';

module.exports = function buildSkillsDataAccess(dependencies) {
  const getSkills = makeGetSkills({ ...dependencies, tableName: TABLE_NAME });
  const getSkillById = makeGetSkillById({ ...dependencies, tableName: TABLE_NAME });
  const getSkillsByIds = makeGetSkillsByIds({ ...dependencies, tableName: TABLE_NAME });
  const createSkill = makeCreateSkill({ ...dependencies, tableName: TABLE_NAME });
  const updateSkill = makeUpdateSkill({ ...dependencies, tableName: TABLE_NAME });
  const deleteSkill = makeDeleteSkill({ ...dependencies, tableName: TABLE_NAME });

  return {
    getSkills,
    getSkillById,
    getSkillsByIds,
    createSkill,
    updateSkill,
    deleteSkill,
  };
};
