function makeCreateAuthorizationCodeDataAccess({ logger, mysqlPool, tableName }) {
  return async function createAuthorizationCodeDataAccess({
    codeHash,
    clientId,
    userId,
    redirectUri,
    codeChallenge,
    scope,
    resource,
    expiresAt,
  }) {
    try {
      const query = `
        INSERT INTO ${tableName}
          (code_hash, client_id, user_id, redirect_uri, code_challenge, scope, resource, expires_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;

      await mysqlPool.query(query, [codeHash, clientId, userId, redirectUri, codeChallenge, scope, resource, expiresAt]);
    } catch (error) {
      logger.error('Database query failed in createAuthorizationCodeDataAccess:', error.message);
      throw error;
    }
  };
}

module.exports = makeCreateAuthorizationCodeDataAccess;
