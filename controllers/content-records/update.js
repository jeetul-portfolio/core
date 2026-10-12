const { validate, emptyStringsToNull } = require('./request-helpers');

function makeUpdateController({ handle, records, schemas }) {
  return handle('update', 200, (req) => records().update(
    emptyStringsToNull(validate(schemas.update, { ...(req.body || {}), id: req.params.id }))
  ));
}

module.exports = makeUpdateController;
