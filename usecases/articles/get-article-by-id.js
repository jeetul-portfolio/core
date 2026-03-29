function makeGetArticleByIdUsecase({ dataAccess, presentArticleDetail, NotFoundError }) {
  return async function getArticleByIdUsecase({ id, includeDrafts = false }) {
    const article = await dataAccess.articles.getArticleById({ id, includeDrafts });

    if (!article) {
      throw new NotFoundError(`Article not found for id ${id}`);
    }

    return presentArticleDetail(article);
  };
}

module.exports = makeGetArticleByIdUsecase;
