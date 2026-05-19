const makeGetResumesController = require('./get-resumes');
const makeGetActiveResumeController = require('./get-active-resume');
const makeCreateResumeController = require('./create-resume');
const makeActivateResumeController = require('./activate-resume');
const makeDeleteResumeController = require('./delete-resume');
const Joi = require('joi');
const { ValidationError } = require('../../exceptions');

module.exports = function buildResumesController(dependencies) {
  const controllerDependencies = {
    ...dependencies,
    Joi,
    ValidationError,
  };

  return {
    getResumes: makeGetResumesController(controllerDependencies),
    getActiveResume: makeGetActiveResumeController(controllerDependencies),
    createResume: makeCreateResumeController(controllerDependencies),
    activateResume: makeActivateResumeController(controllerDependencies),
    deleteResume: makeDeleteResumeController(controllerDependencies),
  };
};
