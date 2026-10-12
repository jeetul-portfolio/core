/** API field -> column/kind map; the only columns the data access reads or writes. */
const FIELDS = {
  slug: { column: 'slug', kind: 'string' },
  title: { column: 'title', kind: 'string' },
  summary: { column: 'summary', kind: 'string' },
  description: { column: 'description', kind: 'string' },
  problem: { column: 'problem', kind: 'string' },
  solution: { column: 'solution', kind: 'string' },
  technicalDecisions: { column: 'technical_decisions', kind: 'string' },
  outcomes: { column: 'outcomes', kind: 'string' },
  technologies: { column: 'technologies', kind: 'json' },
  tags: { column: 'tags', kind: 'json' },
  links: { column: 'links', kind: 'json' },
  coverImage: { column: 'cover_image', kind: 'string' },
  images: { column: 'images', kind: 'json' },
  isFeatured: { column: 'is_featured', kind: 'bool' },
  sortOrder: { column: 'sort_order', kind: 'int' },
  status: { column: 'status', kind: 'string' },
  publishedAt: { column: 'published_at', kind: 'datetime' },
};

module.exports = FIELDS;
