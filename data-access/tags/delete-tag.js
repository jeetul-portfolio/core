function makeDeleteTagDataAccess({ logger, mysqlPool, tableName }) {
  return async function deleteTagDataAccess({ id }) {
    try {
      const [result] = await mysqlPool.query(
        `DELETE FROM ${tableName} WHERE id = ?`,
        [id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      logger.error('Database query failed in deleteTagDataAccess:', error.message);
      throw error;
    }
  };
}

module.exports = makeDeleteTagDataAccess;
