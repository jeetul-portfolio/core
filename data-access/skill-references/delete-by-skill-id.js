function makeDeleteBySkillIdDataAccess({ logger, mysqlPool, tableName }) {
  return async function deleteBySkillIdDataAccess({ skillId }) {
    try {
      await mysqlPool.query(`DELETE FROM ${tableName} WHERE skill_id = ?`, [skillId]);
    } catch (error) {
      logger.error('Database query failed in deleteBySkillIdDataAccess:', error.message);
      throw error;
    }
  };
}

module.exports = makeDeleteBySkillIdDataAccess;
