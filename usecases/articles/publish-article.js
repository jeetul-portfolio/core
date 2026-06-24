function makePublishArticleUsecase({ dataAccess, NotFoundError, presentArticleDetail }) {
  return async function publishArticleUsecase({ id, action }) {
    const current = await dataAccess.articles.getArticleById({ id, includeDrafts: true });
    if (!current) {
      throw new NotFoundError(`Article not found for id ${id}`);
    }

    const payload = { id };

    if (action === 'publish') {
      payload.status = 'published';
      if (!current.publishedAt) {
        payload.publishedAt = new Date().toISOString();
      }
    } else {
      payload.status = 'draft';
      payload.publishedAt = null;
    }

    await dataAccess.articles.updateArticle(payload);

    const article = await dataAccess.articles.getArticleById({ id, includeDrafts: true });
    if (!article) {
      throw new NotFoundError(`Article not found for id ${id}`);
    }

    return presentArticleDetail(article);
  };
}

module.exports = makePublishArticleUsecase;
