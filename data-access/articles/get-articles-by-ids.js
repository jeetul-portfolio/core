function makeGetArticlesByIdsDataAccess({ logger, mysqlPool, tableName }) {
  return async function getArticlesByIdsDataAccess({ ids, includeDrafts = false }) {
    if (!ids || ids.length === 0) return [];

    try {
      const placeholders = ids.map(() => '?').join(', ');
      const statusClause = includeDrafts ? '' : " AND status = 'published'";
      const query = `
        SELECT
          id,
          title,
          status,
          published_at AS publishedAt
        FROM ${tableName}
        WHERE id IN (${placeholders})${statusClause}
      `;

      const [rows] = await mysqlPool.query(query, ids);
      return rows;
    } catch (error) {
      logger.error('Database query failed in getArticlesByIdsDataAccess:', error.message);
      throw error;
    }
  };
}

module.exports = makeGetArticlesByIdsDataAccess;
