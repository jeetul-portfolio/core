
const buildSampleUsecase = require('./sample');

module.exports = function(dependencies) {
  return {
    getSampleData: buildSampleUsecase(dependencies),
  };
};

