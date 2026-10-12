/**
 * articles.tags (JSON list of display names) is the canonical tag list for an article.
 * tag_references is a derived index rebuilt from it (plus `##tag` refs in content),
 * so every sync is idempotent and heals any earlier drift.
 */
async function syncArticleTags({ syncEntityTags, parseTagsFromStorage, article }) {
  await syncEntityTags({
    entityType: 'article',
    entityId: article.id,
    explicitTags: [...parseTagsFromStorage(article.tags), ...extractTagRefs(article.content)],
    textFields: [],
  });
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

module.exports = { syncArticleTags };
