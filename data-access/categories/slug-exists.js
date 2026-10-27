function makeCategorySlugExistsDataAccess({ logger, mysqlPool, tableName }) {
  return async function categorySlugExistsDataAccess({ slug, excludeId = 0 }) {
    try {
      const [rows] = await mysqlPool.query(
        `SELECT id FROM ${tableName} WHERE slug = ? AND id <> ? LIMIT 1`,
        [slug, excludeId]
      );
      return rows.length > 0;
    } catch (error) {
      logger.error('Database query failed in categorySlugExistsDataAccess:', error.message);
      throw error;
    }
  };
}

module.exports = makeCategorySlugExistsDataAccess;
