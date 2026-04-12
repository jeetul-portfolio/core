function presentTag(row) {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    group: row.group || null,
    color: row.color || null,
    description: row.description || null,
    usageCount: Number(row.usageCount) || 0,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

module.exports = { presentTag };
