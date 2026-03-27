function makeFindUserForLoginByEmailDataAccess({ logger, mysqlPool }) {
  return async function findUserForLoginByEmailDataAccess({ email }) {
    try {
      const [rows] = await mysqlPool.query(
        `
          SELECT
            id,
            email,
            password_hash AS passwordHash,
            full_name AS fullName,
            is_active AS isActive,
            failed_login_count AS failedLoginCount,
            locked_until AS lockedUntil
          FROM users
          WHERE email = ?
          LIMIT 1
        `,
        [email]
      );

      return rows[0] || null;
    } catch (error) {
      logger.error('Database query failed in findUserForLoginByEmailDataAccess:', error.message);
      throw error;
    }
  };
}

module.exports = makeFindUserForLoginByEmailDataAccess;
