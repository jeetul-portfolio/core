const { validate } = require('../content-records/request-helpers');

function makeAssignArticleController({ handle, series, schemas }) {
  return handle('assignArticle', 200, (req) => series().assignArticle(validate(schemas.assign, {
    ...(req.body || {}),
    seriesId: req.params.id,
    articleId: req.params.articleId,
  })));
}

module.exports = makeAssignArticleController;
