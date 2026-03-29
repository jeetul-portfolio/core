function makeUpdateArticleUsecase({
  dataAccess,
  NotFoundError,
  presentArticleDetail,
  buildExcerpt,
  normalizeTagsForStorage,
}) {
  return async function updateArticleUsecase(input) {
    const payload = buildPayload(input, buildExcerpt, normalizeTagsForStorage);
    const updated = await dataAccess.articles.updateArticle(payload);

    if (!updated) {
      throw new NotFoundError(`Article not found for id ${input.id}`);
    }

    const article = await dataAccess.articles.getArticleById({
      id: input.id,
      includeDrafts: true,
    });

    if (!article) {
      throw new NotFoundError(`Article not found for id ${input.id}`);
    }

    return presentArticleDetail(article);
  };
}

function buildPayload(input, buildExcerpt, normalizeTagsForStorage) {
  const payload = {
    id: input.id,
  };

  if (Object.prototype.hasOwnProperty.call(input, 'title')) {
    payload.title = input.title;
  }

  if (Object.prototype.hasOwnProperty.call(input, 'tags')) {
    payload.tags = normalizeTagsForStorage(input.tags);
  }

  if (Object.prototype.hasOwnProperty.call(input, 'content')) {
    payload.content = input.content;
    payload.excerpt = buildExcerpt(input.content);
  } else if (Object.prototype.hasOwnProperty.call(input, 'excerpt')) {
    payload.excerpt = buildExcerpt(input.excerpt || '');
  }

  if (Object.prototype.hasOwnProperty.call(input, 'coverImage')) {
    payload.coverImage = normalizeNullable(input.coverImage);
  }

  if (Object.prototype.hasOwnProperty.call(input, 'authorName')) {
    payload.authorName = normalizeNullable(input.authorName);
  }

  if (Object.prototype.hasOwnProperty.call(input, 'authorAvatar')) {
    payload.authorAvatar = normalizeNullable(input.authorAvatar);
  }

  if (Object.prototype.hasOwnProperty.call(input, 'status')) {
    payload.status = input.status;
  }

  if (Object.prototype.hasOwnProperty.call(input, 'publishedAt')) {
    payload.publishedAt = normalizeNullable(input.publishedAt);
  }

  if (payload.status === 'published' && !payload.publishedAt) {
    payload.publishedAt = new Date().toISOString();
  }

  return payload;
}

function normalizeNullable(value) {
  if (value === null || value === undefined) {
    return null;
  }

  const normalized = String(value).trim();
  return normalized === '' ? null : normalized;
}

module.exports = makeUpdateArticleUsecase;
