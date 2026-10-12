const makeRunQuery = require('./run-query');
const makeList = require('./list');
const makeGetByIdOrSlug = require('./get-by-id-or-slug');
const makeGetByIds = require('./get-by-ids');
const makeSlugExists = require('./slug-exists');
const makeCreate = require('./create');
const makeUpdate = require('./update');
const makeRemove = require('./remove');
const makeReorder = require('./reorder');
const { buildSelectList } = require('./sql-helpers');

/**
 * Data access for publishable content tables (experiences, projects).
 * Each entity supplies { tableName, fields, searchColumns, orderBy }.
 */
module.exports = function buildContentRecordsDataAccess(dependencies) {
  const deps = {
    ...dependencies,
    runQuery: makeRunQuery(dependencies),
    selectList: buildSelectList(dependencies.fields),
  };

  return {
    list: makeList(deps),
    getByIdOrSlug: makeGetByIdOrSlug(deps),
    getByIds: makeGetByIds(deps),
    slugExists: makeSlugExists(deps),
    create: makeCreate(deps),
    update: makeUpdate(deps),
    remove: makeRemove(deps),
    reorder: makeReorder(deps),
  };
};
