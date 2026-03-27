function makeRevokeAllRefreshTokensForUserDataAccess({ mysqlPool, logger }) {
  return async function revokeAllRefreshTokensForUserDataAccess({ userId, reason }) {
    try {
      await mysqlPool.query(
        `
          UPDATE refresh_tokens
          SET revoked_at = NOW(), revoke_reason = ?
          WHERE user_id = ? AND revoked_at IS NULL
        `,
        [reason || null, userId]
      );
    } catch (error) {
      logger.error('Database query failed in revokeAllRefreshTokensForUserDataAccess:', error.message);
      throw error;
    }
  };
}

module.exports = makeRevokeAllRefreshTokensForUserDataAccess;