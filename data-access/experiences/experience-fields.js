/** API field -> column/kind map; the only columns the data access reads or writes. */
const FIELDS = {
  slug: { column: 'slug', kind: 'string' },
  role: { column: 'role', kind: 'string' },
  company: { column: 'company', kind: 'string' },
  companyUrl: { column: 'company_url', kind: 'string' },
  logoUrl: { column: 'logo_url', kind: 'string' },
  location: { column: 'location', kind: 'string' },
  employmentType: { column: 'employment_type', kind: 'string' },
  startDate: { column: 'start_date', kind: 'date' },
  endDate: { column: 'end_date', kind: 'date' },
  isCurrent: { column: 'is_current', kind: 'bool' },
  summary: { column: 'summary', kind: 'string' },
  description: { column: 'description', kind: 'string' },
  responsibilities: { column: 'responsibilities', kind: 'json' },
  achievements: { column: 'achievements', kind: 'json' },
  technologies: { column: 'technologies', kind: 'json' },
  tags: { column: 'tags', kind: 'json' },
  links: { column: 'links', kind: 'json' },
  sortOrder: { column: 'sort_order', kind: 'int' },
  status: { column: 'status', kind: 'string' },
  publishedAt: { column: 'published_at', kind: 'datetime' },
};

module.exports = FIELDS;
