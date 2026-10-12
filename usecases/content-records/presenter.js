const JSON_ARRAY_FIELDS = ['responsibilities', 'achievements', 'technologies', 'tags', 'links', 'images'];
const BOOLEAN_FIELDS = ['isCurrent', 'isFeatured'];
const TIMESTAMP_FIELDS = ['publishedAt', 'createdAt', 'updatedAt'];

/** Maps a content-records row (camelCase aliases from SQL) to the API shape. */
function presentRecord(row, skills) {
  const record = { ...row, skills };

  JSON_ARRAY_FIELDS.forEach((field) => {
    if (field in row) record[field] = parseJsonArray(row[field]);
  });
  BOOLEAN_FIELDS.forEach((field) => {
    if (field in row) record[field] = Boolean(Number(row[field]));
  });
  TIMESTAMP_FIELDS.forEach((field) => {
    if (field in row) record[field] = toIsoDate(row[field]);
  });

  record.status = row.status || 'draft';
  record.sortOrder = Number(row.sortOrder) || 0;
  return record;
}

// JSON columns arrive parsed; legacy LONGTEXT values (experiences.achievements) arrive as strings.
function parseJsonArray(value) {
  if (Array.isArray(value)) return value;
  if (value === null || value === undefined || value === '') return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return String(value).split('\n').map((line) => line.trim()).filter(Boolean);
  }
}

function toIsoDate(value) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

module.exports = { presentRecord, parseJsonArray };
