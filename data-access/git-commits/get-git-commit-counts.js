function makeGetGitCommitCountsDataAccess({ logger, mysqlPool, tableName }) {
  return async function getGitCommitCountsDataAccess({ projectIds = [] } = {}) {
    try {
      if (!Array.isArray(projectIds) || projectIds.length === 0) {
        return [];
      }

      const placeholders = projectIds.map(() => '?').join(', ');
      const query = `
        SELECT projectId, COUNT(*) AS totalCommitCount
        FROM ${tableName}
        WHERE projectId IN (${placeholders})
        GROUP BY projectId
      `;

      const [rows] = await mysqlPool.query(query, projectIds);
      return rows;
    } catch (error) {
      logger.error('Database query failed in getGitCommitCountsDataAccess:', error.message);
      throw error;
    }
  };
}

module.exports = makeGetGitCommitCountsDataAccess;