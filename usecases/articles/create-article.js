function makeCreateArticleUsecase({
  dataAccess,
  getArticleById,
  presentArticleDetail,
  buildExcerpt,
  normalizeTagsForStorage,
}) {
  return async function createArticleUsecase(input) {
    const payload = buildPayload(input, buildExcerpt, normalizeTagsForStorage);
    const created = await dataAccess.articles.createArticle(payload);
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
