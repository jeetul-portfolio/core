const { extractHashtags } = require('../../utils/extract-hashtags');

/**
 * Syncs tags for a given entity.
 * Merges explicit tags passed in the payload with #hashtags extracted from
 * any text/HTML content fields, then upserts the tag_references table.
 *
 * Usage: syncEntityTags({ entityType, entityId, explicitTags, textFields })
 *   - entityType: string, e.g. 'article', 'skill', 'profile'
 *   - entityId: number
 *   - explicitTags: string[] of tag names from form fields (optional)
 *   - textFields: string[] of raw text/HTML values to scan for #hashtags (optional)
 */
function makeSyncEntityTagsUsecase({ dataAccess }) {
  return async function syncEntityTagsUsecase({ entityType, entityId, explicitTags = [], textFields = [] }) {
    const allTagNames = new Set();

    // Merge explicit tags (normalized to lowercase slug)
    for (const tag of explicitTags) {
      const normalized = slugify(tag);
      if (normalized) {
        allTagNames.add(normalized);
      }
    }

    // Extract #hashtags from all provided text/HTML fields
    for (const field of textFields) {
      if (field) {
        const found = extractHashtags(field);
        for (const tag of found) {
          allTagNames.add(tag); // extractHashtags already lowercases
        }
      }
    }

    if (allTagNames.size === 0) {
      await dataAccess.tagReferences.upsertReferences({ entityType, entityId, tagIds: [] });
      return;
    }

    // find-or-create each unique tag, collect their IDs
    const tagIds = await Promise.all(
      Array.from(allTagNames).map((name) =>
        dataAccess.tags.findOrCreateTag({ name, slug: name })
      )
    );

    const validTagIds = tagIds.filter(Boolean);
    await dataAccess.tagReferences.upsertReferences({ entityType, entityId, tagIds: validTagIds });
  };
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

module.exports = makeSyncEntityTagsUsecase;
