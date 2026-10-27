const { validate } = require('../content-records/request-helpers');

function makeReorderPartsController({ handle, series, schemas }) {
  return handle('reorderParts', 200, (req) => series().reorderParts(validate(schemas.reorderParts, {
    ...(req.body || {}),
    seriesId: req.params.id,
  })));
}

module.exports = makeReorderPartsController;
