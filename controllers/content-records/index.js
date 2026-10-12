const makeHandler = require('./make-handler');
const buildSchemas = require('./build-schemas');
const makeListPublishedController = require('./list-published');
const makeGetPublishedController = require('./get-published');
const makeListAllController = require('./list-all');
const makeGetAnyController = require('./get-any');
const makeCreateController = require('./create');
const makeUpdateController = require('./update');
const makeRemoveController = require('./remove');
const makeSetPublishedController = require('./set-published');
const makeReorderController = require('./reorder');

/**
 * Express handlers shared by publishable content entities.
 * definition: { usecaseKey, createSchema, requiredKeys, listFilters? }
 */
function buildContentRecordsController(dependencies, definition) {
  const deps = {
    handle: makeHandler({ ...dependencies, usecaseKey: definition.usecaseKey }),
    records: () => dependencies.usecase[definition.usecaseKey],
    schemas: buildSchemas(definition),
  };

  return {
    listPublished: makeListPublishedController(deps),
    getPublished: makeGetPublishedController(deps),
    listAll: makeListAllController(deps),
    getAny: makeGetAnyController(deps),
    create: makeCreateController(deps),
    update: makeUpdateController(deps),
    remove: makeRemoveController(deps),
    setPublished: makeSetPublishedController(deps),
    reorder: makeReorderController(deps),
  };
}

module.exports = buildContentRecordsController;
