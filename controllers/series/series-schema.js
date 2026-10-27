const Joi = require('joi');
const { fieldTypes: t } = require('../content-records/field-types');

const createSchema = Joi.object({
  title: Joi.string().trim().min(1).max(255).required(),
  slug: t.slug(),
  description: t.text(5000),
  coverImage: t.url(),
  sortOrder: t.sortOrder(),
  status: t.status(),
  publishedAt: t.publishedAt(),
});

const MAX_PARTS = 500;

const membershipSchemas = {
  assign: Joi.object({
    seriesId: t.id(),
    articleId: t.id(),
    // null (default) = plain association; a positive integer = sequential part number.
    partNumber: Joi.number().integer().min(1).max(100000).allow(null).default(null),
    // Move the sequential part from another series (kept there as a plain association).
    reassign: Joi.boolean().default(false),
  }),
  remove: Joi.object({ seriesId: t.id(), articleId: t.id() }),
  reorderParts: Joi.object({
    seriesId: t.id(),
    articleIds: Joi.array().items(Joi.number().integer().min(1)).unique().min(1).max(MAX_PARTS).required(),
  }),
  articleId: Joi.object({ articleId: t.id() }),
};

module.exports = { createSchema, membershipSchemas };
