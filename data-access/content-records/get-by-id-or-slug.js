function makeGetByIdOrSlugDataAccess({ runQuery, tableName, selectList }) {
  return async function getByIdOrSlugDataAccess({ id, slug, publishedOnly = false }) {
    const statusClause = publishedOnly ? " AND status = 'published'" : '';
    const [column, value] = id ? ['id', id] : ['slug', slug];
    const rows = await runQuery('getByIdOrSlug', `
      SELECT ${selectList}
      FROM ${tableName}
      WHERE ${column} = ?${statusClause}
      LIMIT 1
    `, [value]);
    return rows[0] || null;
  };
}

module.exports = makeGetByIdOrSlugDataAccess;
