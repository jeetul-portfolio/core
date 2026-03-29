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

  const deduped = new Set();
  values.forEach((value) => {
    const normalized = String(value || '').trim();
    if (normalized) {
      deduped.add(normalized);
    }
  });

  return Array.from(deduped);
}

module.exports = {
  normalizeTagsForStorage,
  parseTagsFromStorage,
};