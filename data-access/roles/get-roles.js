function makeGetRolesDataAccess({ logger, mysqlPool }) {
  return async function getRolesDataAccess() {
    try {
      const [rows] = await mysqlPool.query(
        `
          SELECT id, code, name
          FROM roles
          ORDER BY id ASC
        `
      );

      return rows;
    } catch (error) {
      logger.error('Database query failed in getRolesDataAccess:', error.message);
      throw error;
    }
  };
}

module.exports = makeGetRolesDataAccess;
