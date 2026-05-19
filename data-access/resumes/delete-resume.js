function makeDeleteResumeDataAccess({ logger, mysqlPool, tableName }) {
  return async function deleteResumeDataAccess({ id }) {
    try {
      const query = `DELETE FROM ${tableName} WHERE id = ?`;
      await mysqlPool.query(query, [id]);
    } catch (error) {
      logger.error('Database query failed in deleteResumeDataAccess:', error.message);
      throw error;
    }
  };
}

module.exports = makeDeleteResumeDataAccess;
