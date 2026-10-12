const { parseIdOrSlug } = require('./request-helpers');

/** Admin read: returns drafts too. */
function makeGetAnyController({ handle, records }) {
  return handle('getAny', 200, (req) => records().get(parseIdOrSlug(req.params.idOrSlug)));
}

module.exports = makeGetAnyController;
