const { validate } = require('./request-helpers');

function makeListPublishedController({ handle, records, schemas }) {
  return handle('listPublished', 200, (req) => records().list({
    ...validate(schemas.publicList, req.query),
    publishedOnly: true,
  }));
}

module.exports = makeListPublishedController;
