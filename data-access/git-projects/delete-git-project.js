/** Deletes a git project; its git_commits rows go with it (ON DELETE CASCADE). */
function makeDeleteGitProjectDataAccess({ logger, mysqlPool, tableName }) {
  return async function deleteGitProjectDataAccess({ projectId }) {
    try {
      const [result] = await mysqlPool.query(`DELETE FROM ${tableName} WHERE id = ?`, [projectId]);
      return result.affectedRows > 0;
    } catch (error) {
      logger.error('Database query failed in deleteGitProjectDataAccess:', error.message);
      throw error;
    }
  };
}

module.exports = makeDeleteGitProjectDataAccess;
