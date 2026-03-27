function makeUpdateUserLoginMetaDataAccess({ logger, mysqlPool }) {
  return async function updateUserLoginMetaDataAccess({ userId }) {
    try {
      await mysqlPool.query(
        `
          UPDATE users
          SET
            failed_login_count = 0,
            locked_until = NULL,
            last_login_at = NOW()
          WHERE id = ?
        `,
        [userId]
      );
    } catch (error) {
      logger.error('Database query failed in updateUserLoginMetaDataAccess:', error.message);
      throw error;
    }
  };
}

module.exports = makeUpdateUserLoginMetaDataAccess;
