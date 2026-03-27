function makeDeleteGitCommitsByProjectIdDataAccess({ logger, mysqlPool, tableName }) {
  return async function deleteGitCommitsByProjectIdDataAccess({ projectId }) {
    try {
      const [result] = await mysqlPool.query(
        `
          DELETE FROM ${tableName}
          WHERE projectId = ?
        `,
        [projectId],
      );

      return result.affectedRows;
    } catch (error) {
      logger.error('Database query failed in deleteGitCommitsByProjectIdDataAccess:', error.message);
      throw error;
    }
  };
}

module.exports = makeDeleteGitCommitsByProjectIdDataAccess;