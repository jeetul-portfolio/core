function makeGetRoleIdsByUserIdDataAccess({ logger, mysqlPool }) {
  return async function getRoleIdsByUserIdDataAccess({ userId }) {
    try {
      const [rows] = await mysqlPool.query(
        `
          SELECT role_id AS roleId
          FROM user_roles
          WHERE user_id = ?
          ORDER BY role_id ASC
        `,
        [userId]
      );

      return rows.map((row) => row.roleId);
    } catch (error) {
      logger.error('Database query failed in getRoleIdsByUserIdDataAccess:', error.message);
      throw error;
    }
  };
}

module.exports = makeGetRoleIdsByUserIdDataAccess;
