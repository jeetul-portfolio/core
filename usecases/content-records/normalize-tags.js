const { parseTagsFromStorage } = require('../../utils/tags-storage');

/** Dedupes tags by slug ("NATS JetStream" == " nats  jetstream"); first spelling wins. */
function normalizeTags(fields) {
  return fields.tags ? { ...fields, tags: parseTagsFromStorage(fields.tags) } : fields;
}

module.exports = normalizeTags;
