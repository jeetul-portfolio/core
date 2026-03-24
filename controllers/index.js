
const buildSampleController = require('./sample');
const buildGitController = require('./git');
const { formatResponse, formatError } = require('./response-formatter');

module.exports = function(dependencies) {
  const controllerDependencies = {
    ...dependencies,
    formatResponse,
    formatError,
  };

  return {
    getSampleData: buildSampleController(controllerDependencies),
    ...buildGitController(controllerDependencies),
  };
};
