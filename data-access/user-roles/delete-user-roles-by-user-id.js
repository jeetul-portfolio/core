function makeDeleteUserRolesByUserIdDataAccess({ logger, mysqlPool }) {
  return async function deleteUserRolesByUserIdDataAccess({ userId }) {
    try {
      const [result] = await mysqlPool.query(
        `
          DELETE FROM user_roles
          WHERE user_id = ?
        `,
        [userId]
      );

      return result.affectedRows;
    } catch (error) {
      logger.error('Database query failed in deleteUserRolesByUserIdDataAccess:', error.message);
      throw error;
    }
  };
}

module.exports = makeDeleteUserRolesByUserIdDataAccess;