const { validate } = require('./request-helpers');

function makeSetPublishedController({ handle, records, schemas }) {
  return handle('setPublished', 200, (req) => records().setPublished(
    validate(schemas.publish, { ...(req.body || {}), id: req.params.id })
  ));
}

module.exports = makeSetPublishedController;
