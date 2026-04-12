const makeGetTagsDataAccess = require('./get-tags');
const makeGetTagByIdDataAccess = require('./get-tag-by-id');
const makeFindOrCreateTagDataAccess = require('./find-or-create-tag');
const makeUpdateTagDataAccess = require('./update-tag');
const makeDeleteTagDataAccess = require('./delete-tag');
const makeGetTagGraphDataAccess = require('./get-tag-graph');

const TABLE_NAME = 'tags';

module.exports = function buildTagsDataAccess(dependencies) {
  const deps = { ...dependencies, tableName: TABLE_NAME };

  return {
    getTags: makeGetTagsDataAccess(deps),
    getTagById: makeGetTagByIdDataAccess(deps),
    findOrCreateTag: makeFindOrCreateTagDataAccess(deps),
    updateTag: makeUpdateTagDataAccess(deps),
    deleteTag: makeDeleteTagDataAccess(deps),
    getTagGraph: makeGetTagGraphDataAccess(deps),
  };
};
