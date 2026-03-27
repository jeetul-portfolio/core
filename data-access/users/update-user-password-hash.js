function makeUpdateUserPasswordHashDataAccess({ logger, mysqlPool }) {
  return async function updateUserPasswordHashDataAccess({ id, passwordHash }) {
    try {
      await mysqlPool.query(
        `
          UPDATE users
          SET password_hash = ?, updated_at = NOW()
          WHERE id = ?
        `,
        [passwordHash, id]
      );
    } catch (error) {
      logger.error('Database query failed in updateUserPasswordHashDataAccess:', error.message);
      throw error;
    }
  };
}

module.exports = makeUpdateUserPasswordHashDataAccess;
