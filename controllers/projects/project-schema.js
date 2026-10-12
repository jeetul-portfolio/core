const Joi = require('joi');
const { fieldTypes: t } = require('../content-records/field-types');

const LINK_TYPES = ['repository', 'demo', 'documentation', 'other'];

const createSchema = Joi.object({
  title: Joi.string().trim().min(1).max(255).required(),
  slug: t.slug(),
  summary: t.text(2000),
  description: t.text(100000),
  problem: t.text(100000),
  solution: t.text(100000),
  technicalDecisions: t.text(100000),
  outcomes: t.text(100000),
  technologies: t.stringList(80),
  tags: t.stringList(80),
  skillIds: t.skillIds(),
  links: Joi.array().items(Joi.object({
    type: Joi.string().valid(...LINK_TYPES).default('other'),
    label: Joi.string().trim().min(1).max(120).required(),
    url: t.url().invalid(null, '').required(),
  })).max(20).allow(null),
  coverImage: t.url(),
  images: Joi.array().items(Joi.object({
    url: t.url().invalid(null, '').required(),
    alt: Joi.string().trim().max(255).allow(''),
  })).max(20).allow(null),
  isFeatured: Joi.boolean(),
  sortOrder: t.sortOrder(),
  status: t.status(),
  publishedAt: t.publishedAt(),
});

const listFilters = {
  featured: Joi.boolean().truthy('1').falsy('0'),
  tag: Joi.string().trim().max(80),
};

module.exports = { createSchema, listFilters, LINK_TYPES };
