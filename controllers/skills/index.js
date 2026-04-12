const makeGetSkillsController = require('./get-skills');
const makeGetSkillByIdController = require('./get-skill-by-id');
const makeCreateSkillController = require('./create-skill');
const makeUpdateSkillController = require('./update-skill');
const makeDeleteSkillController = require('./delete-skill');
const Joi = require('joi');
const { ValidationError } = require('../../exceptions');

module.exports = function buildSkillsController(dependencies) {
  const controllerDependencies = {
    ...dependencies,
    Joi,
    ValidationError,
  };

  return {
    getSkills: makeGetSkillsController(controllerDependencies),
    getSkillById: makeGetSkillByIdController(controllerDependencies),
    createSkill: makeCreateSkillController(controllerDependencies),
    updateSkill: makeUpdateSkillController(controllerDependencies),
    deleteSkill: makeDeleteSkillController(controllerDependencies),
  };
};
