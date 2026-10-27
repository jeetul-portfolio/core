const buildContentRecordsDataAccess = require('../content-records');
const FIELDS = require('./series-fields');

module.exports = function buildSeriesDataAccess(dependencies) {
  return buildContentRecordsDataAccess({
    ...dependencies,
    tableName: 'series',
    fields: FIELDS,
    searchColumns: ['title', 'description'],
    orderBy: 'sort_order ASC, COALESCE(published_at, created_at) DESC, id DESC',
  });
};
