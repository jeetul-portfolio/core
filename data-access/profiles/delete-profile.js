function makeDeleteProfileDataAccess({ logger, mysqlPool }) {
  return async function deleteProfileDataAccess({ id }) {
    try {
      const [result] = await mysqlPool.query(
        `
          DELETE FROM profiles
          WHERE id = ?
        `,
        [id],
      );

      return result.affectedRows > 0;
    } catch (error) {
      logger.error('Database query failed in deleteProfileDataAccess:', error.message);
      throw error;
    }
  };
}

module.exports = makeDeleteProfileDataAccess;
