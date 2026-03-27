const toUtcMysqlDatetime = require('../../utils/to-utc-mysql-datetime');

function makeCreateRefreshTokenDataAccess({ mysqlPool, logger }) {
  return async function createRefreshTokenDataAccess({
    userId,
    tokenHash,
    tokenFamilyId,
    expiresAt,
    ipAddress,
    userAgent,
  }) {
    try {
      await mysqlPool.query(
        `
          INSERT INTO refresh_tokens
            (user_id, token_hash, token_family_id, issued_at, expires_at, ip_address, user_agent, created_at)
          VALUES
            (?, ?, ?, NOW(), ?, ?, ?, NOW())
        `,
        [
          userId,
          tokenHash,
          tokenFamilyId,
          toUtcMysqlDatetime(expiresAt),
          ipAddress || null,
          userAgent || null,
        ]
      );
    } catch (error) {
      logger.error('Database query failed in createRefreshTokenDataAccess:', error.message);
      throw error;
    }
  };
}

module.exports = makeCreateRefreshTokenDataAccess;