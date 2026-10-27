/** Removes the article from the series; the article itself is untouched. */
function makeRemoveArticleUsecase({ dataAccess, NotFoundError }) {
  return async function removeArticleUsecase({ seriesId, articleId }) {
    const removed = await dataAccess.seriesArticles.removeMembership({ seriesId, articleId });
    if (!removed) {
      throw new NotFoundError(`Article ${articleId} is not in series ${seriesId}`);
    }
    return { seriesId, articleId, removed: true };
  };
}

module.exports = makeRemoveArticleUsecase;
