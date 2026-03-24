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
        [syncedAt, projectId],
      );

      if (!Array.isArray(commits) || commits.length === 0) {
        await connection.query(
          `
            DELETE FROM ${tableName}
            WHERE projectId = ?
          `,
          [projectId],
        );

        await connection.commit();
        return { inserted: 0, updated: 0 };
      }

      const commitHashes = commits.map((commit) => commit.fullHash);
      const placeholders = commitHashes.map(() => '?').join(', ');

      await connection.query(
        `
          DELETE FROM ${tableName}
          WHERE projectId = ? AND fullHash NOT IN (${placeholders})
        `,
        [projectId, ...commitHashes],
      );

      const [existingRows] = await connection.query(
        `
          SELECT id, fullHash
          FROM ${tableName}
          WHERE projectId = ? AND fullHash IN (${placeholders})
        `,
        [projectId, ...commitHashes],
      );

      const existingByHash = new Map(existingRows.map((row) => [row.fullHash, row.id]));
      let inserted = 0;
      let updated = 0;

      for (let index = 0; index < commits.length; index += 1) {
        const commit = commits[index];
        const positionRank = index + 1;
        const isLatest = index === 0 ? 1 : 0;

        if (existingByHash.has(commit.fullHash)) {
          updated += 1;
          await connection.query(
            `
              UPDATE ${tableName}
              SET shortHash = ?,
                  message = ?,
                  authorName = ?,
                  authorAvatarUrl = ?,
                  committedAt = ?,
                  commitUrl = ?,
                  additions = ?,
                  deletions = ?,
                  positionRank = ?,
                  isLatest = ?,
                  syncedAt = ?,
                  isAccessible = ?,
                  lastAccessCheckedAt = NOW(),
                  updatedAt = NOW()
              WHERE id = ?
            `,
            [
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
              existingByHash.get(commit.fullHash),
            ],
          );
        } else {
          inserted += 1;
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
      }

      await connection.commit();
      return { inserted, updated };
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