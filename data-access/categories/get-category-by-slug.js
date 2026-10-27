function makeGetCategoryBySlugDataAccess({ logger, mysqlPool, tableName }) {
  return async function getCategoryBySlugDataAccess({ slug }) {
    try {
      const query = `
        SELECT
          id,
          name,
          slug,
          description,
          sort_order AS sortOrder,
          created_at AS createdAt,
          updated_at AS updatedAt
        FROM ${tableName}
        WHERE slug = ?
        LIMIT 1
      `;

      const [rows] = await mysqlPool.query(query, [slug]);
      return rows[0] || null;
    } catch (error) {
      logger.error('Database query failed in getCategoryBySlugDataAccess:', error.message);
      throw error;
    }
  };
}

module.exports = makeGetCategoryBySlugDataAccess;
