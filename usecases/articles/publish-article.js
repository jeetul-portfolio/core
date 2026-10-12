const { syncArticleTags } = require('./sync-article-tags');

function makePublishArticleUsecase({
  dataAccess,
  NotFoundError,
  presentArticleDetail,
  parseTagsFromStorage,
  syncEntityTags,
}) {
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

    // Publish (and republish) rebuilds tag_references from the canonical articles.tags;
    // unpublish removes them so drafts don't count toward tag usage.
    if (syncEntityTags) {
      if (action === 'publish') {
        await syncArticleTags({ syncEntityTags, parseTagsFromStorage, article });
      } else {
        await dataAccess.tagReferences.deleteByEntity({ entityType: 'article', entityId: id });
      }
    }

    return presentArticleDetail(article);
  };
}

module.exports = makePublishArticleUsecase;
