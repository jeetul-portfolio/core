function makeInsertUserRolesDataAccess({ logger, mysqlPool }) {
  return async function insertUserRolesDataAccess({ userId, roleIds }) {
    if (!Array.isArray(roleIds) || roleIds.length === 0) {
      return 0;
    }

    try {
      const now = new Date();
      const values = roleIds.map((roleId) => [userId, roleId, now]);
      const [result] = await mysqlPool.query(
        `
          INSERT INTO user_roles (user_id, role_id, created_at)
          VALUES ?
        `,
        [values]
      );

      return result.affectedRows;
    } catch (error) {
      logger.error('Database query failed in insertUserRolesDataAccess:', error.message);
      throw error;
    }
  };
}

module.exports = makeInsertUserRolesDataAccess;