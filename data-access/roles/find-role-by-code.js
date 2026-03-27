function makeFindRoleByCodeDataAccess({ logger, mysqlPool }) {
  return async function findRoleByCodeDataAccess({ code }) {
    try {
      const [rows] = await mysqlPool.query(
        `
          SELECT id, code, name
          FROM roles
          WHERE code = ?
          LIMIT 1
        `,
        [code]
      );

      return rows[0] || null;
    } catch (error) {
      logger.error('Database query failed in findRoleByCodeDataAccess:', error.message);
      throw error;
    }
  };
}

module.exports = makeFindRoleByCodeDataAccess;
