function makeDeleteCategoryDataAccess({ logger, mysqlPool, tableName }) {
  return async function deleteCategoryDataAccess({ id }) {
    try {
      const query = `DELETE FROM ${tableName} WHERE id = ?`;
      const [result] = await mysqlPool.query(query, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      logger.error('Database query failed in deleteCategoryDataAccess:', error.message);
      throw error;
    }
  };
}

module.exports = makeDeleteCategoryDataAccess;
