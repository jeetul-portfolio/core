function normalizeTagsForStorage(input) {
  const tags = normalizeTagsInput(input);

  if (tags.length === 0) {
    return null;
  }

  return JSON.stringify(tags);
}

function parseTagsFromStorage(input) {
  if (Array.isArray(input)) {
    return normalizeTagsInput(input);
  }

  if (input === null || input === undefined) {
    return [];
  }

  const raw = String(input).trim();
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return normalizeTagsInput(parsed);
    }
  } catch (error) {
    // Fallback to comma-separated tags for legacy/non-JSON values.
  }

  return normalizeTagsInput(raw.split(','));
}

function normalizeTagsInput(input) {
  const values = Array.isArray(input)
    ? input
    : String(input || '').split(',');

  // Dedupe by slug so "NATS JetStream" and " nats  jetstream" collapse to one tag (first wins).
  const deduped = new Map();
  values.forEach((value) => {
    const normalized = String(value || '').trim().replace(/\s+/g, ' ');
    const slug = slugifyTag(normalized);
    if (slug && !deduped.has(slug)) {
      deduped.set(slug, normalized);
    }
  });

  return Array.from(deduped.values());
}

function slugifyTag(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

module.exports = {
  normalizeTagsForStorage,
  parseTagsFromStorage,
  slugifyTag,
};