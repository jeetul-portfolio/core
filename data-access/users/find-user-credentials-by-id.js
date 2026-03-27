function makeFindUserCredentialsByIdDataAccess({ logger, mysqlPool }) {
  return async function findUserCredentialsByIdDataAccess({ id }) {
    try {
      const [rows] = await mysqlPool.query(
        `
          SELECT id, password_hash AS passwordHash
          FROM users
          WHERE id = ?
          LIMIT 1
        `,
        [id]
      );

      return rows[0] || null;
    } catch (error) {
      logger.error('Database query failed in findUserCredentialsByIdDataAccess:', error.message);
      throw error;
    }
  };
}

module.exports = makeFindUserCredentialsByIdDataAccess;
