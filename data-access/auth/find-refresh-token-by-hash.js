function makeFindRefreshTokenByHashDataAccess({ mysqlPool, logger }) {
  return async function findRefreshTokenByHashDataAccess({ tokenHash }) {
    try {
      const [rows] = await mysqlPool.query(
        `
          SELECT
            id,
            user_id AS userId,
            token_hash AS tokenHash,
            token_family_id AS tokenFamilyId,
            expires_at AS expiresAt,
            revoked_at AS revokedAt
          FROM refresh_tokens
          WHERE token_hash = ?
          LIMIT 1
        `,
        [tokenHash]
      );

      return rows[0] || null;
    } catch (error) {
      logger.error('Database query failed in findRefreshTokenByHashDataAccess:', error.message);
      throw error;
    }
  };
}

module.exports = makeFindRefreshTokenByHashDataAccess;