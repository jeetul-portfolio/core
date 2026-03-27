function makeFindUserByIdDataAccess({ logger, mysqlPool }) {
  return async function findUserByIdDataAccess({ id }) {
    try {
      const [rows] = await mysqlPool.query(
        `
          SELECT
            id,
            email,
            full_name AS fullName,
            is_active AS isActive,
            updated_at AS updatedAt,
            last_login_at AS lastLoginAt
          FROM users
          WHERE id = ?
          LIMIT 1
        `,
        [id]
      );

      return rows[0] || null;
    } catch (error) {
      logger.error('Database query failed in findUserByIdDataAccess:', error.message);
      throw error;
    }
  };
}

module.exports = makeFindUserByIdDataAccess;
