function makeDeleteSkillCategoriesBySkillIdDataAccess({ logger, mysqlPool, tableName }) {
  return async function deleteSkillCategoriesBySkillIdDataAccess({ skillId }) {
    try {
      const query = `DELETE FROM ${tableName} WHERE skill_id = ?`;
      await mysqlPool.query(query, [skillId]);
    } catch (error) {
      logger.error('Database query failed in deleteSkillCategoriesBySkillIdDataAccess:', error.message);
      throw error;
    }
  };
}

module.exports = makeDeleteSkillCategoriesBySkillIdDataAccess;
