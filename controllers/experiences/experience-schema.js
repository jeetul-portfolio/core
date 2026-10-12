const Joi = require('joi');
const { fieldTypes: t } = require('../content-records/field-types');

const createSchema = Joi.object({
  role: Joi.string().trim().min(1).max(255).required(),
  company: Joi.string().trim().min(1).max(255).required(),
  slug: t.slug(),
  companyUrl: t.url(),
  logoUrl: t.url(),
  location: t.text(255),
  employmentType: Joi.string().trim().min(1).max(50),
  startDate: t.date(),
  endDate: t.date(),
  isCurrent: Joi.boolean(),
  summary: t.text(2000),
  description: t.text(100000),
  responsibilities: t.stringList(1000),
  achievements: t.stringList(1000),
  technologies: t.stringList(80),
  tags: t.stringList(80),
  skillIds: t.skillIds(),
  links: Joi.array().items(Joi.object({
    label: Joi.string().trim().min(1).max(120).required(),
    url: t.url().invalid(null, '').required(),
  })).max(20).allow(null),
  sortOrder: t.sortOrder(),
  status: t.status(),
  publishedAt: t.publishedAt(),
});

module.exports = { createSchema };
