function presentCategory(category) {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description || null,
    sortOrder: category.sortOrder || 0,
    createdAt: toIsoDate(category.createdAt),
    updatedAt: toIsoDate(category.updatedAt),
    ...(category.articleCount !== undefined ? { articleCount: Number(category.articleCount) } : {}),
  };
}

function toIsoDate(value) {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  return isNaN(d.getTime()) ? null : d.toISOString();
}

module.exports = { presentCategory };
