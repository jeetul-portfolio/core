/**
 * Adds an article to a series or changes its part number (null = plain association).
 * An article is a numbered part of at most one series: if it already is one elsewhere the call
 * fails unless `reassign` is set, in which case the old membership is kept as a plain association,
 * all inside one transaction. Series row first, then article row: a fixed lock order.
 */
function makeAssignArticleUsecase({ dataAccess, getArticleSeries, NotFoundError, ConflictError }) {
  return async function assignArticleUsecase({ seriesId, articleId, partNumber = null, reassign = false }) {
    const store = dataAccess.seriesArticles;

    await store.withTransaction(async (db) => {
      if (!(await store.lockSeries({ seriesId, db }))) {
        throw new NotFoundError(`Series not found for id ${seriesId}`);
      }
      if (!(await store.lockArticle({ articleId, db }))) {
        throw new NotFoundError(`Article not found for id ${articleId}`);
      }

      if (partNumber !== null) {
        const current = await store.getSequentialMembership({ articleId, db });
        if (current && current.seriesId !== seriesId) {
          if (!reassign) {
            throw new ConflictError(
              `Article ${articleId} is already part ${current.partNumber} of series ${current.seriesId}; `
              + 'set reassign to move it'
            );
          }
          await store.setPartNumber({ seriesId: current.seriesId, articleId, partNumber: null, db });
        }
      }

      const existing = await store.getMembership({ seriesId, articleId, db });
      if (existing) {
        await store.setPartNumber({ seriesId, articleId, partNumber, db });
      } else {
        await store.insertMembership({ seriesId, articleId, partNumber, db });
      }
    });

    return getArticleSeries({ articleId, publishedOnly: false });
  };
}

module.exports = makeAssignArticleUsecase;
