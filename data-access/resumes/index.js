const makeGetResumes = require('./get-resumes');
const makeGetResumeById = require('./get-resume-by-id');
const makeGetActiveResume = require('./get-active-resume');
const makeCreateResume = require('./create-resume');
const makeActivateResume = require('./activate-resume');
const makeDeleteResume = require('./delete-resume');

const TABLE_NAME = 'resumes';

module.exports = function buildResumesDataAccess(dependencies) {
  const getResumes = makeGetResumes({ ...dependencies, tableName: TABLE_NAME });
  const getResumeById = makeGetResumeById({ ...dependencies, tableName: TABLE_NAME });
  const getActiveResume = makeGetActiveResume({ ...dependencies, tableName: TABLE_NAME });
  const createResume = makeCreateResume({ ...dependencies, tableName: TABLE_NAME });
  const activateResume = makeActivateResume({ ...dependencies, tableName: TABLE_NAME });
  const deleteResume = makeDeleteResume({ ...dependencies, tableName: TABLE_NAME });

  return {
    getResumes,
    getResumeById,
    getActiveResume,
    createResume,
    activateResume,
    deleteResume,
  };
};
