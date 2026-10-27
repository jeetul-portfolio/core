function makeRemoveArticleCategoryUsecase({ dataAccess, getArticleById, NotFoundError }) {
  return async function removeArticleCategoryUsecase({ id, categoryId }) {
    const removed = await dataAccess.articleCategories.removeFromArticle({ articleId: id, categoryId });
    if (!removed) {
      throw new NotFoundError(`Article ${id} is not in category ${categoryId}`);
    }
    return getArticleById({ id, includeDrafts: true });
  };
}

module.exports = makeRemoveArticleCategoryUsecase;
