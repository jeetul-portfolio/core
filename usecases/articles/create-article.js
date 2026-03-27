const { presentArticleDetail } = require('./article-presenter');

function makeCreateArticleUsecase({ dataAccess }) {
  return async function createArticleUsecase(input) {
    const payload = buildPayload(input);
    const article = await dataAccess.articles.createArticle(payload);

    return presentArticleDetail(article);
  };
}

function buildPayload(input) {
  const now = new Date().toISOString();
  const status = input.status || 'draft';

  return {
    title: input.title,
    excerpt: input.excerpt || buildExcerpt(input.content),
    content: input.content,
    coverImage: normalizeNullable(input.coverImage),
    authorName: normalizeNullable(input.authorName),
    authorAvatar: normalizeNullable(input.authorAvatar),
    status,
    publishedAt: status === 'published' ? (input.publishedAt || now) : normalizeNullable(input.publishedAt),
  };
}

function buildExcerpt(content) {
  const plainText = String(content || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return plainText.slice(0, 240);
}

function normalizeNullable(value) {
  if (value === null || value === undefined) {
    return null;
  }

  const normalized = String(value).trim();
  return normalized === '' ? null : normalized;
}

module.exports = makeCreateArticleUsecase;
