function makeUpsertGitProjectDataAccess({ logger, mysqlPool, tableName }) {
  return async function upsertGitProjectDataAccess({
    projectKey,
    displayName,
    repoOwner,
    repoName,
    repoUrl,
    defaultBranch,
    isActive = true,
    syncStatus = 'success',
    isStale = false,
    lastSyncedAt = null,
    nextSyncAt = null,
  }) {
    try {
      const [existingRows] = await mysqlPool.query(
        `SELECT id FROM ${tableName} WHERE projectKey = ? LIMIT 1`,
        [projectKey],
      );

      const rowPayload = [
        displayName,
        repoOwner,
        repoName,
        repoUrl,
        defaultBranch,
        isActive ? 1 : 0,
        lastSyncedAt,
        nextSyncAt,
        syncStatus,
        isStale ? 1 : 0,
      ];

      if (existingRows.length > 0) {
        const projectId = existingRows[0].id;

        await mysqlPool.query(
          `
            UPDATE ${tableName}
            SET displayName = ?,
                repoOwner = ?,
                repoName = ?,
                repoUrl = ?,
                defaultBranch = ?,
                isActive = ?,
                lastSyncedAt = ?,
                nextSyncAt = ?,
                syncStatus = ?,
                isStale = ?,
                updatedAt = NOW()
            WHERE id = ?
          `,
          [...rowPayload, projectId],
        );

        return projectId;
      }

      const [insertResult] = await mysqlPool.query(
        `
          INSERT INTO ${tableName}
          (projectKey, displayName, repoOwner, repoName, repoUrl, defaultBranch, isActive, lastSyncedAt, nextSyncAt, syncStatus, isStale, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `,
        [projectKey, ...rowPayload],
      );

      return insertResult.insertId;
    } catch (error) {
      logger.error('Database query failed in upsertGitProjectDataAccess:', error.message);
      throw error;
    }
  };
}

module.exports = makeUpsertGitProjectDataAccess;