const { parseIdOrSlug } = require('./request-helpers');

function makeGetPublishedController({ handle, records }) {
  return handle('getPublished', 200, (req) => records().get({
    ...parseIdOrSlug(req.params.idOrSlug),
    publishedOnly: true,
  }));
}

module.exports = makeGetPublishedController;
