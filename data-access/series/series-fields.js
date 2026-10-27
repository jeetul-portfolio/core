/** API field -> column/kind map; the only columns the data access reads or writes. */
const FIELDS = {
  slug: { column: 'slug', kind: 'string' },
  title: { column: 'title', kind: 'string' },
  description: { column: 'description', kind: 'string' },
  coverImage: { column: 'cover_image', kind: 'string' },
  sortOrder: { column: 'sort_order', kind: 'int' },
  status: { column: 'status', kind: 'string' },
  publishedAt: { column: 'published_at', kind: 'datetime' },
};

module.exports = FIELDS;
