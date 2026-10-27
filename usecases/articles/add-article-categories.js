function makeAddArticleCategoriesUsecase({ dataAccess, assertCategoriesExist, getArticleById, NotFoundError }) {
  return async function addArticleCategoriesUsecase({ id, categoryIds }) {
    if (!(await dataAccess.articles.getArticleById({ id, includeDrafts: true }))) {
      throw new NotFoundError(`Article not found for id ${id}`);
    }
    await assertCategoriesExist(categoryIds);
    await dataAccess.articleCategories.addToArticle({ articleId: id, categoryIds });
    return getArticleById({ id, includeDrafts: true });
  };
}

module.exports = makeAddArticleCategoriesUsecase;
