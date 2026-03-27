const toUtcMysqlDatetime = require('../../utils/to-utc-mysql-datetime');

function makeInsertGitCommitsBulkDataAccess({ logger, mysqlPool, tableName }) {
  return async function insertGitCommitsBulkDataAccess({ projectId, commits = [], syncedAt = new Date() }) {
    if (!Array.isArray(commits) || commits.length === 0) {
      return 0;
    }

    try {
      const now = new Date();
      const normalizedNow = toUtcMysqlDatetime(now);
      const normalizedSyncedAt = toUtcMysqlDatetime(syncedAt);
      const values = commits.map((commit, index) => {
        const positionRank = index + 1;
        const isLatest = index === 0 ? 1 : 0;

        return [
          projectId,
          commit.fullHash,
          commit.shortHash,
          commit.message,
          commit.authorName,
          commit.authorAvatarUrl,
          toUtcMysqlDatetime(commit.committedAt),
          commit.commitUrl,
          commit.additions,
          commit.deletions,
          positionRank,
          isLatest,
          normalizedSyncedAt,
          commit.isAccessible ? 1 : 0,
          normalizedNow,
          normalizedNow,
          normalizedNow,
        ];
      });

      const [result] = await mysqlPool.query(
        `
          INSERT INTO ${tableName}
          (projectId, fullHash, shortHash, message, authorName, authorAvatarUrl, committedAt, commitUrl, additions, deletions, positionRank, isLatest, syncedAt, isAccessible, lastAccessCheckedAt, createdAt, updatedAt)
          VALUES ?
        `,
        [values],
      );

      return result.affectedRows;
    } catch (error) {
      logger.error('Database query failed in insertGitCommitsBulkDataAccess:', error.message);
      throw error;
    }
  };
}

module.exports = makeInsertGitCommitsBulkDataAccess;