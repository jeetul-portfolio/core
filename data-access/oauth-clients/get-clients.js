// Never selects client_secret_hash: listings must not carry secret material.
function makeGetClientsDataAccess({ logger, mysqlPool, tableName }) {
  return async function getClientsDataAccess() {
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
        ORDER BY created_at DESC
      `;

      const [rows] = await mysqlPool.query(query);
      return rows;
    } catch (error) {
      logger.error('Database query failed in getClientsDataAccess:', error.message);
      throw error;
    }
  };
}

module.exports = makeGetClientsDataAccess;
