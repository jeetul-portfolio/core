const makeGetResumesUsecase = require('./get-resumes');
const makeGetActiveResumeUsecase = require('./get-active-resume');
const makeCreateResumeUsecase = require('./create-resume');
const makeActivateResumeUsecase = require('./activate-resume');
const makeDeleteResumeUsecase = require('./delete-resume');
const { NotFoundError } = require('../../exceptions');
const { presentResume } = require('./resume-presenter');

module.exports = function buildResumesUsecase(dependencies) {
  const baseDependencies = {
    ...dependencies,
    presentResume,
    NotFoundError,
  };

  return {
    getResumes: makeGetResumesUsecase(baseDependencies),
    getActiveResume: makeGetActiveResumeUsecase(baseDependencies),
    createResume: makeCreateResumeUsecase(baseDependencies),
    activateResume: makeActivateResumeUsecase(baseDependencies),
    deleteResume: makeDeleteResumeUsecase(baseDependencies),
  };
};
