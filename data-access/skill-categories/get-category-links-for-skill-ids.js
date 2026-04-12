function makeGetCategoryLinksForSkillIdsDataAccess({ logger, mysqlPool, tableName }) {
  return async function getCategoryLinksForSkillIdsDataAccess({ skillIds }) {
    if (!skillIds || skillIds.length === 0) {
      return [];
    }

    try {
      const placeholders = skillIds.map(() => '?').join(', ');
      const query = `
        SELECT
          skill_id AS skillId,
          category_id AS categoryId
        FROM ${tableName}
        WHERE skill_id IN (${placeholders})
      `;

      const [rows] = await mysqlPool.query(query, skillIds);
      return rows;
    } catch (error) {
      logger.error('Database query failed in getCategoryLinksForSkillIdsDataAccess:', error.message);
      throw error;
    }
  };
}

module.exports = makeGetCategoryLinksForSkillIdsDataAccess;
