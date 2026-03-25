function makeUpsertGitCommitsForProjectDataAccess({ logger, mysqlPool, tableName }) {
  return async function upsertGitCommitsForProjectDataAccess({ projectId, commits = [], syncedAt = new Date() }) {
    const connection = await mysqlPool.getConnection();

    try {
      await connection.beginTransaction();

      await connection.query(
        `
          UPDATE ${tableName}
          SET isLatest = 0,
              syncedAt = ?,
              updatedAt = NOW()
          WHERE projectId = ?
        `,
        [projectId],
      );

      if (!Array.isArray(commits) || commits.length === 0) {
        await connection.commit();
        return { inserted: 0, updated: 0 };
      }

      for (let index = 0; index < commits.length; index += 1) {
        const commit = commits[index];
        const positionRank = index + 1;
        const isLatest = index === 0 ? 1 : 0;

        await connection.query(
          `
            INSERT INTO ${tableName}
            (projectId, fullHash, shortHash, message, authorName, authorAvatarUrl, committedAt, commitUrl, additions, deletions, positionRank, isLatest, syncedAt, isAccessible, lastAccessCheckedAt, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), NOW())
          `,
          [
            projectId,
            commit.fullHash,
            commit.shortHash,
            commit.message,
            commit.authorName,
            commit.authorAvatarUrl,
            commit.committedAt,
            commit.commitUrl,
            commit.additions,
            commit.deletions,
            positionRank,
            isLatest,
            syncedAt,
            commit.isAccessible ? 1 : 0,
          ],
        );
      }

      await connection.commit();
      return { inserted: commits.length, updated: 0 };
    } catch (error) {
      await connection.rollback();
      logger.error('Database query failed in upsertGitCommitsForProjectDataAccess:', error.message);
      throw error;
    } finally {
      connection.release();
    }
  };
}

module.exports = makeUpsertGitCommitsForProjectDataAccess;