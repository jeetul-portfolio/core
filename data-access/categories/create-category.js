function makeCreateCategoryDataAccess({ logger, mysqlPool, tableName }) {
  return async function createCategoryDataAccess({ name, description, sortOrder }) {
    try {
      const query = `
        INSERT INTO ${tableName}
          (name, description, sort_order, created_at, updated_at)
        VALUES
          (?, ?, ?, NOW(), NOW())
      `;

      const [result] = await mysqlPool.query(query, [
        name,
        description || null,
        sortOrder || 0,
      ]);

      return { id: result.insertId };
    } catch (error) {
      logger.error('Database query failed in createCategoryDataAccess:', error.message);
      throw error;
    }
  };
}

module.exports = makeCreateCategoryDataAccess;
