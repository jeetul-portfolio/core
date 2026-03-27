function makeGetRolesByIdsDataAccess({ logger, mysqlPool }) {
  return async function getRolesByIdsDataAccess({ roleIds }) {
    try {
      if (!Array.isArray(roleIds) || roleIds.length === 0) {
        return [];
      }

      const placeholders = roleIds.map(() => '?').join(', ');
      const [rows] = await mysqlPool.query(
        `
          SELECT id, code, name
          FROM roles
          WHERE id IN (${placeholders})
        `,
        roleIds
      );

      return rows;
    } catch (error) {
      logger.error('Database query failed in getRolesByIdsDataAccess:', error.message);
      throw error;
    }
  };
}

module.exports = makeGetRolesByIdsDataAccess;
