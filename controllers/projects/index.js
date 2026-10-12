const buildContentRecordsController = require('../content-records');
const { createSchema, listFilters } = require('./project-schema');

module.exports = function buildProjectsController(dependencies) {
  return buildContentRecordsController(dependencies, {
    usecaseKey: 'projectsUsecase',
    createSchema,
    requiredKeys: ['title'],
    listFilters,
  });
};
