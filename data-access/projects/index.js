const buildContentRecordsDataAccess = require('../content-records');
const FIELDS = require('./project-fields');

module.exports = function buildProjectsDataAccess(dependencies) {
  return buildContentRecordsDataAccess({
    ...dependencies,
    tableName: 'projects',
    fields: FIELDS,
    searchColumns: ['title', 'summary', 'description'],
    orderBy: 'sort_order ASC, COALESCE(published_at, created_at) DESC, id DESC',
  });
};
