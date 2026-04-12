function makeGetTagsDataAccess({ logger, mysqlPool, tableName }) {
  return async function getTagsDataAccess({ page = 1, pageSize = 50, search = '' } = {}) {
    try {
      const offset = (page - 1) * pageSize;
      const whereClauses = [];
      const params = [];

      if (search) {
        whereClauses.push('(name LIKE ? OR slug LIKE ?)');
        const term = `%${search}%`;
        params.push(term, term);
      }

      const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

      const query = `
        SELECT
          t.id,
          t.name,
          t.slug,
          t.\`group\`,
          t.color,
          t.description,
          t.created_at AS createdAt,
          t.updated_at AS updatedAt,
          COUNT(tr.id) AS usageCount
        FROM ${tableName} t
        LEFT JOIN tag_references tr ON t.id = tr.tag_id
        ${whereClause}
        GROUP BY t.id
        ORDER BY t.name ASC
        LIMIT ? OFFSET ?
      `;

      params.push(pageSize, offset);
      const [rows] = await mysqlPool.query(query, params);
      return rows;
    } catch (error) {
      logger.error('Database query failed in getTagsDataAccess:', error.message);
      throw error;
    }
  };
}

module.exports = makeGetTagsDataAccess;
