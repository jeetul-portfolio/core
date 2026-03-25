
const buildSampleController = require('./sample');
const buildGitController = require('./git');
const buildArticlesController = require('./articles');
const { formatResponse, formatError } = require('./response-formatter');

module.exports = function(dependencies) {
  const controllerDependencies = {
    ...dependencies,
    formatResponse,
    formatError,
  };

  return {
    sampleController: {
      getSampleData: buildSampleController(controllerDependencies),
    },
    gitController: buildGitController(controllerDependencies),
    articlesController: buildArticlesController(controllerDependencies),
  };
};
