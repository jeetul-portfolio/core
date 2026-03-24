function makeUpdateGitProjectSyncStatusDataAccess({ logger, mysqlPool, tableName }) {
  return async function updateGitProjectSyncStatusDataAccess({
    projectId,
    syncStatus,
    lastSyncedAt = null,
    nextSyncAt = null,
    isStale = false,
  }) {
    try {
      const [result] = await mysqlPool.query(
        `
          UPDATE ${tableName}
          SET syncStatus = ?,
              lastSyncedAt = ?,
              nextSyncAt = ?,
              isStale = ?,
              updatedAt = NOW()
          WHERE id = ?
        `,
        [syncStatus, lastSyncedAt, nextSyncAt, isStale ? 1 : 0, projectId],
      );

      return result.affectedRows;
    } catch (error) {
      logger.error('Database query failed in updateGitProjectSyncStatusDataAccess:', error.message);
      throw error;
    }
  };
}

module.exports = makeUpdateGitProjectSyncStatusDataAccess;