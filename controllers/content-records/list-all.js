const { validate } = require('./request-helpers');

/** Admin listing: drafts included, optional status filter. */
function makeListAllController({ handle, records, schemas }) {
  return handle('listAll', 200, (req) => records().list(validate(schemas.adminList, req.query)));
}

module.exports = makeListAllController;
