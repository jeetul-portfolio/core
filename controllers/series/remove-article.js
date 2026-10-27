const { validate } = require('../content-records/request-helpers');

function makeRemoveArticleController({ handle, series, schemas }) {
  return handle('removeArticle', 200, (req) => series().removeArticle(validate(schemas.remove, {
    seriesId: req.params.id,
    articleId: req.params.articleId,
  })));
}

module.exports = makeRemoveArticleController;
