/** Git projects that have no rows in git_commits. */
function makeGetGitProjectsWithoutCommitsDataAccess({ logger, mysqlPool, tableName }) {
  return async function getGitProjectsWithoutCommitsDataAccess() {
    try {
      const [rows] = await mysqlPool.query(`
        SELECT p.id, p.projectKey, p.displayName
        FROM ${tableName} p
        LEFT JOIN git_commits c ON c.projectId = p.id
        WHERE c.id IS NULL
        ORDER BY p.projectKey ASC
      `);
      return rows;
    } catch (error) {
      logger.error('Database query failed in getGitProjectsWithoutCommitsDataAccess:', error.message);
      throw error;
    }
  };
}

module.exports = makeGetGitProjectsWithoutCommitsDataAccess;
