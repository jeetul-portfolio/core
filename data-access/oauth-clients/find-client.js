function makeFindClientDataAccess({ logger, mysqlPool, tableName }) {
  return async function findClientDataAccess({ clientId }) {
    try {
      const query = `
        SELECT
          client_id AS clientId,
          client_name AS clientName,
          client_secret_hash AS secretHash,
          redirect_uris AS redirectUris,
          is_active AS isActive
        FROM ${tableName}
        WHERE client_id = ?
        LIMIT 1
      `;

      const [rows] = await mysqlPool.query(query, [clientId]);
      if (!rows[0]) return null;

      return {
        ...rows[0],
        isActive: Boolean(rows[0].isActive),
        redirectUris: JSON.parse(rows[0].redirectUris),
      };
    } catch (error) {
      logger.error('Database query failed in findClientDataAccess:', error.message);
      throw error;
    }
  };
}

module.exports = makeFindClientDataAccess;
