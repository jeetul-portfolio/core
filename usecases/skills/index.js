const makeGetSkillsUsecase = require('./get-skills');
const makeGetSkillByIdUsecase = require('./get-skill-by-id');
const makeCreateSkillUsecase = require('./create-skill');
const makeUpdateSkillUsecase = require('./update-skill');
const makeDeleteSkillUsecase = require('./delete-skill');
const { NotFoundError } = require('../../exceptions');
const { presentSkill } = require('./skill-presenter');

module.exports = function buildSkillsUsecase(dependencies) {
  const baseDependencies = {
    ...dependencies,
    presentSkill,
    NotFoundError,
  };

  const getSkillById = makeGetSkillByIdUsecase(baseDependencies);

  const usecaseDependencies = {
    ...baseDependencies,
    getSkillById,
  };

  return {
    getSkills: makeGetSkillsUsecase(usecaseDependencies),
    getSkillById,
    createSkill: makeCreateSkillUsecase(usecaseDependencies),
    updateSkill: makeUpdateSkillUsecase(usecaseDependencies),
    deleteSkill: makeDeleteSkillUsecase(usecaseDependencies),
  };
};
