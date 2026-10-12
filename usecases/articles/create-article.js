const { syncArticleTags } = require('./sync-article-tags');

function makeCreateArticleUsecase({
  dataAccess,
  getArticleById,
  presentArticleDetail,
  buildExcerpt,
  normalizeTagsForStorage,
  parseTagsFromStorage,
  syncEntityTags,
}) {
  return async function createArticleUsecase(input) {
    const payload = buildPayload(input, buildExcerpt, normalizeTagsForStorage);
    const created = await dataAccess.articles.createArticle(payload);

    if (syncEntityTags) {
      const row = await dataAccess.articles.getArticleById({ id: created.id, includeDrafts: true });
      try {
        await syncArticleTags({ syncEntityTags, parseTagsFromStorage, article: row });
      } catch (error) {
        // ponytail: compensating delete instead of a cross-table DB transaction; switch to a
        // shared connection if article creation grows more steps. Tags created by find-or-create stay (usage 0).
        await dataAccess.articles.deleteArticle({ id: created.id });
        await dataAccess.tagReferences.deleteByEntity({ entityType: 'article', entityId: created.id });
        throw error;
      }
    }

    const article = await getArticleById({ id: created.id, includeDrafts: true });

    return presentArticleDetail(article);
  };
}

function buildPayload(input, buildExcerpt, normalizeTagsForStorage) {
  const now = new Date().toISOString();
  const status = input.status || 'draft';

  return {
    title: input.title,
    tags: normalizeTagsForStorage(input.tags),
    excerpt: buildExcerpt(input.content),
    content: input.content,
    coverImage: normalizeNullable(input.coverImage),
    authorName: normalizeNullable(input.authorName),
    authorAvatar: normalizeNullable(input.authorAvatar),
    status,
    publishedAt: status === 'published' ? (input.publishedAt || now) : normalizeNullable(input.publishedAt),
  };
}

function normalizeNullable(value) {
  if (value === null || value === undefined) {
    return null;
  }

  const normalized = String(value).trim();
  return normalized === '' ? null : normalized;
}

module.exports = makeCreateArticleUsecase;
