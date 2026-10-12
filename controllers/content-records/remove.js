const { validate } = require('./request-helpers');

function makeRemoveController({ handle, records, schemas }) {
  return handle('remove', 200, (req) => records().remove(validate(schemas.id, { id: req.params.id })));
}

module.exports = makeRemoveController;
