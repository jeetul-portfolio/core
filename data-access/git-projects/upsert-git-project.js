const toUtcMysqlDatetime = require('../../utils/to-utc-mysql-datetime');

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
      const [result] = await mysqlPool.query(
        `
          INSERT INTO ${tableName}
          (projectKey, displayName, repoOwner, repoName, repoUrl, defaultBranch, isActive, lastSyncedAt, nextSyncAt, syncStatus, isStale, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
          ON DUPLICATE KEY UPDATE
            id = LAST_INSERT_ID(id),
            displayName = VALUES(displayName),
            repoOwner = VALUES(repoOwner),
            repoName = VALUES(repoName),
            repoUrl = VALUES(repoUrl),
            defaultBranch = VALUES(defaultBranch),
            isActive = VALUES(isActive),
            lastSyncedAt = VALUES(lastSyncedAt),
            nextSyncAt = VALUES(nextSyncAt),
            syncStatus = VALUES(syncStatus),
            isStale = VALUES(isStale),
            updatedAt = NOW()
        `,
        [
          projectKey,
          displayName,
          repoOwner,
          repoName,
          repoUrl,
          defaultBranch,
          isActive ? 1 : 0,
          toUtcMysqlDatetime(lastSyncedAt),
          toUtcMysqlDatetime(nextSyncAt),
          syncStatus,
          isStale ? 1 : 0,
        ],
      );

      return result.insertId;
    } catch (error) {
      logger.error('Database query failed in upsertGitProjectDataAccess:', error.message);
      throw error;
    }
  };
}

module.exports = makeUpsertGitProjectDataAccess;