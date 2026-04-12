function makeGetReferencesForSkillIdsDataAccess({ logger, mysqlPool, tableName }) {
  return async function getReferencesForSkillIdsDataAccess({ skillIds }) {
    if (!skillIds || skillIds.length === 0) {
      return [];
    }

    try {
      const placeholders = skillIds.map(() => '?').join(', ');
      const query = `
        SELECT
          id,
          skill_id AS skillId,
          type,
          reference_id AS referenceId
        FROM ${tableName}
        WHERE skill_id IN (${placeholders})
        ORDER BY skill_id ASC, type ASC, reference_id ASC
      `;

      const [rows] = await mysqlPool.query(query, skillIds);
      return rows;
    } catch (error) {
      logger.error('Database query failed in getReferencesForSkillIdsDataAccess:', error.message);
      throw error;
    }
  };
}

module.exports = makeGetReferencesForSkillIdsDataAccess;
