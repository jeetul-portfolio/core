const buildContentRecordsUsecase = require('../content-records');

module.exports = function buildProjectsUsecase(dependencies) {
  return buildContentRecordsUsecase(dependencies, {
    entityType: 'project',
    label: 'Project',
    store: dependencies.dataAccess.projects,
    slugSource: (record) => record.title,
  });
};
