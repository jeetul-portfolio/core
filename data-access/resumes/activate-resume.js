function makeActivateResumeDataAccess({ logger, mysqlPool, tableName }) {
  return async function activateResumeDataAccess({ id }) {
    const connection = await mysqlPool.getConnection();
    try {
      await connection.beginTransaction();

      await connection.query(
        `UPDATE ${tableName} SET is_active = FALSE`
      );

      await connection.query(
        `UPDATE ${tableName} SET is_active = TRUE WHERE id = ?`,
        [id]
      );

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      logger.error('Database transaction failed in activateResumeDataAccess:', error.message);
      throw error;
    } finally {
      connection.release();
    }
  };
}

module.exports = makeActivateResumeDataAccess;
