/**
 * An article's series memberships, its sequential series (if any) and the previous/next parts.
 * publishedOnly (public): the article and series must be published and draft neighbours are skipped.
 */
function makeGetArticleSeriesUsecase({ dataAccess, presentSeriesRef, presentNeighbor, NotFoundError }) {
  return async function getArticleSeriesUsecase({ articleId, publishedOnly = false }) {
    const article = await dataAccess.articles.getArticleById({ id: articleId, includeDrafts: !publishedOnly });
    if (!article) {
      throw new NotFoundError(`Article not found for id ${articleId}`);
    }

    const rows = await dataAccess.seriesArticles.listForArticle({ articleId, publishedOnly });
    const sequential = rows.find((row) => row.partNumber !== null);
    const neighbors = sequential
      ? await dataAccess.seriesArticles.getNeighbors({
        seriesId: sequential.id,
        partNumber: sequential.partNumber,
        publishedOnly,
      })
      : null;

    return {
      articleId,
      sequential: sequential
        ? {
          series: presentSeriesRef(sequential),
          partNumber: sequential.partNumber,
          previous: presentNeighbor(neighbors.previous),
          next: presentNeighbor(neighbors.next),
        }
        : null,
      series: rows.map((row) => ({
        ...presentSeriesRef(row),
        partNumber: row.partNumber,
        isSequential: row.partNumber !== null,
      })),
    };
  };
}

module.exports = makeGetArticleSeriesUsecase;
