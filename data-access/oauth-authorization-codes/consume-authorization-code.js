// Atomically marks the code as used; only the first caller gets the row back.
function makeConsumeAuthorizationCodeDataAccess({ logger, mysqlPool, tableName }) {
  return async function consumeAuthorizationCodeDataAccess({ codeHash }) {
    try {
      const [result] = await mysqlPool.query(
        `UPDATE ${tableName} SET used_at = UTC_TIMESTAMP() WHERE code_hash = ? AND used_at IS NULL`,
        [codeHash]
      );
      if (result.affectedRows !== 1) return null;

      const [rows] = await mysqlPool.query(
        `
          SELECT
            client_id AS clientId,
            user_id AS userId,
            redirect_uri AS redirectUri,
            code_challenge AS codeChallenge,
            scope,
            resource,
            expires_at AS expiresAt
          FROM ${tableName}
          WHERE code_hash = ?
          LIMIT 1
        `,
        [codeHash]
      );
      return rows[0] || null;
    } catch (error) {
      logger.error('Database query failed in consumeAuthorizationCodeDataAccess:', error.message);
      throw error;
    }
  };
}

module.exports = makeConsumeAuthorizationCodeDataAccess;
