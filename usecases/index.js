
const buildSampleUsecase = require('./sample');
const buildGitUsecase = require('./git');

module.exports = function(dependencies) {
  return {
    getSampleData: buildSampleUsecase(dependencies),
    ...buildGitUsecase(dependencies),
  };
};

