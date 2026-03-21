
const { getSampleData } = require('./sample');
const { getGreeting } = require('./greeting');

module.exports = function buildDataAccess(dependencies) {
  return {
    getSampleData: getSampleData(dependencies),
    getGreeting: getGreeting(dependencies),
  };
};
