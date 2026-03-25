
const buildSampleUsecase = require('./sample');
const buildGitUsecase = require('./git');
const buildArticlesUsecase = require('./articles');

module.exports = function(dependencies) {
  return {
    sampleUsecase: {
      getSampleData: buildSampleUsecase(dependencies),
    },
    gitUsecase: buildGitUsecase(dependencies),
    articlesUsecase: buildArticlesUsecase(dependencies),
  };
};

