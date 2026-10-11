// Atomic rotation guard: resolves true only for the first caller.
function makeRevokeRefreshTokenDataAccess({ logger, mysqlPool, tableName }) {
  return async function revokeRefreshTokenDataAccess({ tokenHash, replacedByHash = null }) {
    try {
      const query = `
        UPDATE ${tableName}
        SET revoked_at = UTC_TIMESTAMP(), replaced_by_hash = ?
        WHERE token_hash = ? AND revoked_at IS NULL
      `;

      const [result] = await mysqlPool.query(query, [replacedByHash, tokenHash]);
      return result.affectedRows === 1;
    } catch (error) {
      logger.error('Database query failed in revokeRefreshTokenDataAccess:', error.message);
      throw error;
    }
  };
}

module.exports = makeRevokeRefreshTokenDataAccess;
