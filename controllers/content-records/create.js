const { validate, emptyStringsToNull } = require('./request-helpers');

function makeCreateController({ handle, records, schemas }) {
  return handle('create', 201, (req) => records().create(
    emptyStringsToNull(validate(schemas.create, req.body))
  ));
}

module.exports = makeCreateController;
