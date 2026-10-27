function makeGetArticleByIdUsecase({ dataAccess, presentArticleDetail, attachCategories, NotFoundError }) {
  return async function getArticleByIdUsecase({ id, includeDrafts = false }) {
    const article = await dataAccess.articles.getArticleById({ id, includeDrafts });

    if (!article) {
      throw new NotFoundError(`Article not found for id ${id}`);
    }

    const [withCategories] = await attachCategories([article]);
    return presentArticleDetail(withCategories);
  };
}

module.exports = makeGetArticleByIdUsecase;
