function makeGetRoleIdsByUserIdsDataAccess({ logger, mysqlPool }) {
  return async function getRoleIdsByUserIdsDataAccess({ userIds }) {
    try {
      if (!Array.isArray(userIds) || userIds.length === 0) {
        return [];
      }

      const placeholders = userIds.map(() => '?').join(', ');
      const [rows] = await mysqlPool.query(
        `
          SELECT user_id AS userId, role_id AS roleId
          FROM user_roles
          WHERE user_id IN (${placeholders})
          ORDER BY user_id ASC, role_id ASC
        `,
        userIds
      );

      return rows;
    } catch (error) {
      logger.error('Database query failed in getRoleIdsByUserIdsDataAccess:', error.message);
      throw error;
    }
  };
}

module.exports = makeGetRoleIdsByUserIdsDataAccess;
