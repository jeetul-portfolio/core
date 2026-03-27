function makeRevokeRefreshTokenByHashDataAccess({ mysqlPool, logger }) {
  return async function revokeRefreshTokenByHashDataAccess({ tokenHash, reason, replacedByTokenHash }) {
    try {
      const [result] = await mysqlPool.query(
        `
          UPDATE refresh_tokens
          SET
            revoked_at = NOW(),
            revoke_reason = ?,
            replaced_by_token_hash = ?
          WHERE token_hash = ? AND revoked_at IS NULL
        `,
        [reason || null, replacedByTokenHash || null, tokenHash]
      );

      return result.affectedRows > 0;
    } catch (error) {
      logger.error('Database query failed in revokeRefreshTokenByHashDataAccess:', error.message);
      throw error;
    }
  };
}

module.exports = makeRevokeRefreshTokenByHashDataAccess;