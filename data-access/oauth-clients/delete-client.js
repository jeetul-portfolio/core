// Codes and refresh tokens issued to the client are removed by ON DELETE CASCADE.
function makeDeleteClientDataAccess({ logger, mysqlPool, tableName }) {
  return async function deleteClientDataAccess({ clientId }) {
    try {
      const [result] = await mysqlPool.query(`DELETE FROM ${tableName} WHERE client_id = ?`, [clientId]);
      return result.affectedRows > 0;
    } catch (error) {
      logger.error('Database query failed in deleteClientDataAccess:', error.message);
      throw error;
    }
  };
}

module.exports = makeDeleteClientDataAccess;
