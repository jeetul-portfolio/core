function makeFindUserByEmailDataAccess({ logger, mysqlPool }) {
  return async function findUserByEmailDataAccess({ email }) {
    try {
      const [rows] = await mysqlPool.query(
        `
          SELECT id, email
          FROM users
          WHERE email = ?
          LIMIT 1
        `,
        [email]
      );

      return rows[0] || null;
    } catch (error) {
      logger.error('Database query failed in findUserByEmailDataAccess:', error.message);
      throw error;
    }
  };
}

module.exports = makeFindUserByEmailDataAccess;
