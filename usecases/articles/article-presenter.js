const TAG_INFERENCE_RULES = [
  { tag: 'Engineering', keywords: ['engineering', 'architecture', 'system', 'timeline', 'build'] },
  { tag: 'Backend', keywords: ['backend', 'api', 'server', 'database', 'mysql'] },
  { tag: 'React', keywords: ['react', 'frontend', 'ui'] },
  { tag: 'Kubernetes', keywords: ['kubernetes', 'k8s', 'cluster', 'deployment'] },
];

function presentArticleListItem(article) {
  return {
    id: article.id,
    slug: buildSlug(article.title),
    title: article.title,
    excerpt: article.excerpt,
    tags: inferTags(article),
    publishedAt: toIsoDate(article.publishedAt || article.createdAt),
    readTime: estimateReadTime(article.content),
  };
}

function presentArticleDetail(article) {
  return {
    id: article.id,
    slug: buildSlug(article.title),
    title: article.title,
    tags: inferTags(article),
    authorName: article.authorName,
    authorAvatarUrl: article.authorAvatar,
    publishedAt: toIsoDate(article.publishedAt || article.createdAt),
    readTime: estimateReadTime(article.content),
    excerpt: article.excerpt,
    content: article.content,
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

function inferTags(article) {
  const haystack = `${article.title || ''} ${article.excerpt || ''} ${article.content || ''}`.toLowerCase();
  const tags = TAG_INFERENCE_RULES
    .filter((rule) => rule.keywords.some((keyword) => haystack.includes(keyword)))
    .map((rule) => rule.tag);

  return tags;
}

function toIsoDate(value) {
  if (!value) {
    return null;
  }

  return new Date(value).toISOString();
}

module.exports = {
  presentArticleListItem,
  presentArticleDetail,
};
