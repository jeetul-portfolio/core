function makeUpdateArticleUsecase({
  dataAccess,
  NotFoundError,
  presentArticleDetail,
  buildExcerpt,
  normalizeTagsForStorage,
  syncEntityTags,
}) {
  return async function updateArticleUsecase(input) {
    const current = await dataAccess.articles.getArticleById({ id: input.id, includeDrafts: true });
    if (!current) {
      throw new NotFoundError(`Article not found for id ${input.id}`);
    }

    const payload = buildPayload(input, buildExcerpt, normalizeTagsForStorage, current.status);
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

    if (syncEntityTags) {
      const explicitTags = Object.prototype.hasOwnProperty.call(input, 'tags')
        ? Array.isArray(input.tags)
          ? input.tags
          : typeof input.tags === 'string' ? input.tags.split(',').map((t) => t.trim()).filter(Boolean) : []
        : undefined;

      if (explicitTags !== undefined || Object.prototype.hasOwnProperty.call(input, 'content')) {
        const contentToScan = Object.prototype.hasOwnProperty.call(input, 'content')
          ? input.content
          : article.content;

        const doubleHashTags = extractTagRefs(contentToScan);

        await syncEntityTags({
          entityType: 'article',
          entityId: input.id,
          explicitTags: [...(explicitTags || []), ...doubleHashTags],
          textFields: [],
        });
      }
    }

    return presentArticleDetail(article);
  };
}

function buildPayload(input, buildExcerpt, normalizeTagsForStorage, currentStatus) {
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

  const alreadyPublished = (currentStatus || '').toLowerCase() === 'published';
  if (payload.status === 'published' && !payload.publishedAt && !alreadyPublished) {
    payload.publishedAt = new Date().toISOString();
  }

  return payload;
}

function extractTagRefs(content) {
  if (!content || typeof content !== 'string') return [];
  const pattern = /##([a-zA-Z][\w-]*)/g;
  const found = new Set();
  let match;
  while ((match = pattern.exec(content)) !== null) {
    found.add(match[1].toLowerCase());
  }
  return Array.from(found);
}

function normalizeNullable(value) {
  if (value === null || value === undefined) {
    return null;
  }

  const normalized = String(value).trim();
  return normalized === '' ? null : normalized;
}

module.exports = makeUpdateArticleUsecase;
