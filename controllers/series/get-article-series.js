const { validate } = require('../content-records/request-helpers');

/** Public: published series only, draft neighbours skipped. Admin: everything. */
function makeGetArticleSeriesController({ handle, series, schemas }, { publishedOnly }) {
  return handle(publishedOnly ? 'getArticleSeries' : 'getArticleSeriesAdmin', 200, (req) => series().getArticleSeries({
    ...validate(schemas.articleId, { articleId: req.params.id }),
    publishedOnly,
  }));
}

module.exports = makeGetArticleSeriesController;
