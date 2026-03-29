function buildArticlePresenter({ parseTagsFromStorage }) {
  function presentArticleListItem(article) {
    const tags = getTags(article);

    return {
      id: article.id,
      slug: buildSlug(article.title),
      title: article.title,
      excerpt: article.excerpt,
      tags,
      status: normalizeStatus(article.status),
      publishedAt: toIsoDate(article.publishedAt || article.createdAt),
      createdAt: toIsoDate(article.createdAt),
      updatedAt: toIsoDate(article.updatedAt),
      readTime: estimateReadTime(article.content),
    };
  }

  function presentArticleDetail(article) {
    const tags = getTags(article);

    return {
      id: article.id,
      slug: buildSlug(article.title),
      title: article.title,
      tags,
      status: normalizeStatus(article.status),
      authorName: article.authorName,
      authorAvatarUrl: article.authorAvatar,
      coverImage: article.coverImage,
      publishedAt: toIsoDate(article.publishedAt || article.createdAt),
      createdAt: toIsoDate(article.createdAt),
      updatedAt: toIsoDate(article.updatedAt),
      readTime: estimateReadTime(article.content),
      excerpt: article.excerpt,
      content: article.content,
    };
  }

  function getTags(article) {
    return parseTagsFromStorage(article.tags);
  }

  return {
    presentArticleListItem,
    presentArticleDetail,
  };
}

function buildSlug(input) {
  return String(input || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function estimateReadTime(content) {
  const wordCount = String(content || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  const minutes = Math.max(1, Math.ceil(wordCount / 200));
  return `${minutes} min read`;
}

function toIsoDate(value) {
  if (!value) {
    return null;
  }

  return new Date(value).toISOString();
}

function normalizeStatus(status) {
  const normalized = String(status || '').toLowerCase();
  if (!normalized) {
    return 'draft';
  }

  return normalized;
}

module.exports = {
  buildArticlePresenter,
};
