const buildContentRecordsDataAccess = require('../content-records');
const FIELDS = require('./experience-fields');

module.exports = function buildExperiencesDataAccess(dependencies) {
  return buildContentRecordsDataAccess({
    ...dependencies,
    tableName: 'experiences',
    fields: FIELDS,
    searchColumns: ['role', 'company', 'summary', 'description'],
    // Explicit display order first, then reverse-chronological (current roles on top).
    orderBy: "sort_order ASC, is_current DESC, COALESCE(end_date, '9999-12-31') DESC, start_date DESC, id DESC",
  });
};
