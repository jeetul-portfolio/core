const makeUpsertReferencesDataAccess = require('./upsert-references');
const makeDeleteByEntityDataAccess = require('./delete-by-entity');
const makeGetByEntityDataAccess = require('./get-by-entity');

const TABLE_NAME = 'tag_references';

module.exports = function buildTagReferencesDataAccess(dependencies) {
  const deps = { ...dependencies, tableName: TABLE_NAME };

  return {
    upsertReferences: makeUpsertReferencesDataAccess(deps),
    deleteByEntity: makeDeleteByEntityDataAccess(deps),
    getByEntity: makeGetByEntityDataAccess(deps),
  };
};
