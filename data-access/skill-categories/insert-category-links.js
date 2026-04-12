function makeInsertCategoryLinksDataAccess({ logger, mysqlPool, tableName }) {
  return async function insertCategoryLinksDataAccess({ skillId, categoryIds }) {
    if (!categoryIds || categoryIds.length === 0) {
      return;
    }

    try {
      const placeholders = categoryIds.map(() => '(?, ?)').join(', ');
      const values = categoryIds.flatMap((categoryId) => [skillId, categoryId]);

      const query = `
        INSERT IGNORE INTO ${tableName} (skill_id, category_id)
        VALUES ${placeholders}
      `;

      await mysqlPool.query(query, values);
    } catch (error) {
      logger.error('Database query failed in insertCategoryLinksDataAccess:', error.message);
      throw error;
    }
  };
}

module.exports = makeInsertCategoryLinksDataAccess;
