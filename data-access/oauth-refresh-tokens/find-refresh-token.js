function makeFindRefreshTokenDataAccess({ logger, mysqlPool, tableName }) {
  return async function findRefreshTokenDataAccess({ tokenHash }) {
    try {
      const query = `
        SELECT
          family_id AS familyId,
          client_id AS clientId,
          user_id AS userId,
          scope,
          resource,
          expires_at AS expiresAt,
          revoked_at AS revokedAt
        FROM ${tableName}
        WHERE token_hash = ?
        LIMIT 1
      `;

      const [rows] = await mysqlPool.query(query, [tokenHash]);
      return rows[0] || null;
    } catch (error) {
      logger.error('Database query failed in findRefreshTokenDataAccess:', error.message);
      throw error;
    }
  };
}

module.exports = makeFindRefreshTokenDataAccess;
