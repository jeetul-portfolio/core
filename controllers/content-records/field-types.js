const Joi = require('joi');

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function assertRealDate(value, helpers) {
  const parsed = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) {
    return helpers.error('any.invalid');
  }
  return value;
}

/** Reusable Joi building blocks for content-record request bodies. */
const fieldTypes = {
  id: () => Joi.number().integer().min(1).required(),
  slug: () => Joi.string().trim().max(160).pattern(SLUG_PATTERN, 'lowercase-hyphenated slug'),
  url: () => Joi.string().trim().max(1024).uri({ scheme: ['http', 'https'] }).allow(null, ''),
  text: (max) => Joi.string().trim().max(max).allow(null, ''),
  date: () => Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD').custom(assertRealDate).allow(null),
  stringList: (itemMax) => Joi.array().items(Joi.string().trim().min(1).max(itemMax)).max(50).allow(null),
  skillIds: () => Joi.array().items(Joi.number().integer().min(1)).unique().max(100),
  sortOrder: () => Joi.number().integer().min(0).max(1000000),
  status: () => Joi.string().valid('draft', 'published'),
  publishedAt: () => Joi.date().iso().allow(null),
};

module.exports = { fieldTypes, SLUG_PATTERN };
