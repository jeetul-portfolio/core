function makeSlugExistsDataAccess({ runQuery, tableName }) {
  return async function slugExistsDataAccess({ slug, excludeId = 0 }) {
    const rows = await runQuery('slugExists', `
      SELECT id FROM ${tableName} WHERE slug = ? AND id <> ? LIMIT 1
    `, [slug, excludeId]);
    return rows.length > 0;
  };
}

module.exports = makeSlugExistsDataAccess;
