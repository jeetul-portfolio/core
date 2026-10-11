function makeFindClientByNameDataAccess({ logger, mysqlPool, tableName }) {
  return async function findClientByNameDataAccess({ clientName }) {
    try {
      const query = `
        SELECT client_id AS clientId
        FROM ${tableName}
        WHERE client_name = ?
        LIMIT 1
      `;

      const [rows] = await mysqlPool.query(query, [clientName]);
      return rows[0] || null;
    } catch (error) {
      logger.error('Database query failed in findClientByNameDataAccess:', error.message);
      throw error;
    }
  };
}

module.exports = makeFindClientByNameDataAccess;
