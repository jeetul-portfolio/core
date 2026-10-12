const buildContentRecordsController = require('../content-records');
const { createSchema } = require('./experience-schema');

module.exports = function buildExperiencesController(dependencies) {
  return buildContentRecordsController(dependencies, {
    usecaseKey: 'experiencesUsecase',
    createSchema,
    requiredKeys: ['role', 'company'],
  });
};
