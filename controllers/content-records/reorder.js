const { validate } = require('./request-helpers');

function makeReorderController({ handle, records, schemas }) {
  return handle('reorder', 200, (req) => records().reorder(validate(schemas.reorder, req.body)));
}

module.exports = makeReorderController;
