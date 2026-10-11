function makeGetClientByIdDataAccess({ logger, mysqlPool, tableName }) {
  return async function getClientByIdDataAccess({ clientId }) {
    try {
      const query = `
        SELECT
          client_id AS clientId,
          client_name AS clientName,
          redirect_uris AS redirectUris,
          is_active AS isActive,
          created_at AS createdAt,
          updated_at AS updatedAt
        FROM ${tableName}
        WHERE client_id = ?
        LIMIT 1
      `;

      const [rows] = await mysqlPool.query(query, [clientId]);
      return rows[0] || null;
    } catch (error) {
      logger.error('Database query failed in getClientByIdDataAccess:', error.message);
      throw error;
    }
  };
}

module.exports = makeGetClientByIdDataAccess;
