function makeGetLinksForCategoryIdsDataAccess({ logger, mysqlPool, tableName }) {
  return async function getLinksForCategoryIdsDataAccess({ categoryIds }) {
    if (!categoryIds || categoryIds.length === 0) {
      return [];
    }

    try {
      const placeholders = categoryIds.map(() => '?').join(', ');
      const query = `
        SELECT
          skill_id AS skillId,
          category_id AS categoryId
        FROM ${tableName}
        WHERE category_id IN (${placeholders})
      `;

      const [rows] = await mysqlPool.query(query, categoryIds);
      return rows;
    } catch (error) {
      logger.error('Database query failed in getLinksForCategoryIdsDataAccess:', error.message);
      throw error;
    }
  };
}

module.exports = makeGetLinksForCategoryIdsDataAccess;
