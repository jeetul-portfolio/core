const { ValidationError } = require('../../exceptions');
const { SLUG_PATTERN } = require('./field-types');

function validate(schema, input) {
  const { error, value } = schema.validate(input || {});
  if (error) {
    throw new ValidationError(error.message);
  }
  return value;
}

/** "42" -> { id: 42 }, "my-project" -> { slug }, anything else -> ValidationError. */
function parseIdOrSlug(raw) {
  const value = String(raw || '');
  if (/^\d+$/.test(value) && Number(value) > 0) {
    return { id: Number(value) };
  }
  if (value.length <= 160 && SLUG_PATTERN.test(value)) {
    return { slug: value };
  }
  throw new ValidationError('Expected a positive numeric id or a lowercase-hyphenated slug');
}

/** Optional text cleared with '' is stored as NULL. */
function emptyStringsToNull(value) {
  return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, v === '' ? null : v]));
}

module.exports = { validate, parseIdOrSlug, emptyStringsToNull };
