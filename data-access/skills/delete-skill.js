function makeDeleteSkillDataAccess({ logger, mysqlPool, tableName }) {
  return async function deleteSkillDataAccess({ id }) {
    try {
      const query = `
        DELETE FROM ${tableName}
        WHERE id = ?
      `;

      const [result] = await mysqlPool.query(query, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      logger.error('Database query failed in deleteSkillDataAccess:', error.message);
      throw error;
    }
  };
}

module.exports = makeDeleteSkillDataAccess;
