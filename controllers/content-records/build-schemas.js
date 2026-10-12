const Joi = require('joi');
const { fieldTypes } = require('./field-types');

const MAX_REORDER_IDS = 500;

/**
 * Derives every request schema from the entity's create schema:
 * update = same rules, nothing required, at least one field besides id.
 */
function buildSchemas({ createSchema, requiredKeys, listFilters = {} }) {
  const publicList = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    pageSize: Joi.number().integer().min(1).max(100).default(50),
    search: Joi.string().trim().max(200).allow('').default(''),
    ...listFilters,
  });

  return {
    create: createSchema,
    update: createSchema
      .fork(requiredKeys, (schema) => schema.optional())
      .keys({ id: fieldTypes.id() })
      .min(2)
      .messages({ 'object.min': 'provide at least one field to update' }),
    publicList,
    adminList: publicList.keys({
      pageSize: Joi.number().integer().min(1).max(500).default(50),
      status: fieldTypes.status().optional(),
    }),
    id: Joi.object({ id: fieldTypes.id() }),
    publish: Joi.object({
      id: fieldTypes.id(),
      action: Joi.string().valid('publish', 'unpublish').required(),
    }),
    reorder: Joi.object({
      ids: Joi.array().items(Joi.number().integer().min(1)).unique().min(1).max(MAX_REORDER_IDS).required(),
    }),
  };
}

module.exports = buildSchemas;
