function makeDeleteArticleDataAccess({ logger, mysqlPool, tableName }) {
  return async function deleteArticleDataAccess({ id }) {
    try {
      const query = `
        DELETE FROM ${tableName}
        WHERE id = ?
      `;

      const [result] = await mysqlPool.query(query, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      logger.error('Database query failed in deleteArticleDataAccess:', error.message);
      throw error;
    }
  };
}

module.exports = makeDeleteArticleDataAccess;
