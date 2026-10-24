function makeGetArticleTitlesDataAccess({ logger, mysqlPool, tableName }) {
  return async function getArticleTitlesDataAccess({ includeDrafts = false } = {}) {
    try {
      const whereClause = includeDrafts ? '' : " WHERE status = 'published'";
      const query = `SELECT id, title FROM ${tableName}${whereClause}`;

      const [rows] = await mysqlPool.query(query);
      return rows;
    } catch (error) {
      logger.error('Database query failed in getArticleTitlesDataAccess:', error.message);
      throw error;
    }
  };
}

module.exports = makeGetArticleTitlesDataAccess;
