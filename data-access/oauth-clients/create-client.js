function makeCreateClientDataAccess({ logger, mysqlPool, tableName }) {
  return async function createClientDataAccess({ clientId, clientName, secretHash, redirectUris, isActive }) {
    try {
      const query = `
        INSERT INTO ${tableName}
          (client_id, client_name, client_secret_hash, redirect_uris, is_active)
        VALUES (?, ?, ?, ?, ?)
      `;

      await mysqlPool.query(query, [clientId, clientName, secretHash, JSON.stringify(redirectUris), isActive ? 1 : 0]);
    } catch (error) {
      logger.error('Database query failed in createClientDataAccess:', error.message);
      throw error;
    }
  };
}

module.exports = makeCreateClientDataAccess;
