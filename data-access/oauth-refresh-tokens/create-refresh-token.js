function makeCreateRefreshTokenDataAccess({ logger, mysqlPool, tableName }) {
  return async function createRefreshTokenDataAccess({
    tokenHash,
    familyId,
    clientId,
    userId,
    scope,
    resource,
    expiresAt,
  }) {
    try {
      const query = `
        INSERT INTO ${tableName}
          (token_hash, family_id, client_id, user_id, scope, resource, expires_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

      await mysqlPool.query(query, [tokenHash, familyId, clientId, userId, scope, resource, expiresAt]);
    } catch (error) {
      logger.error('Database query failed in createRefreshTokenDataAccess:', error.message);
      throw error;
    }
  };
}

module.exports = makeCreateRefreshTokenDataAccess;
