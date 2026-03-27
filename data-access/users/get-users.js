function makeGetUsersDataAccess({ logger, mysqlPool }) {
  return async function getUsersDataAccess({ page = 1, pageSize = 20 } = {}) {
    try {
      const offset = (page - 1) * pageSize;

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
          ORDER BY id DESC
          LIMIT ? OFFSET ?
        `,
        [pageSize, offset]
      );

      return rows;
    } catch (error) {
      logger.error('Database query failed in getUsersDataAccess:', error.message);
      throw error;
    }
  };
}

module.exports = makeGetUsersDataAccess;
