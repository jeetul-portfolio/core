/** Skills linked to the given references, e.g. all skills of projects [1, 2]. */
function makeGetSkillsForReferencesDataAccess({ logger, mysqlPool, tableName }) {
  return async function getSkillsForReferencesDataAccess({ type, referenceIds }) {
    if (!referenceIds || referenceIds.length === 0) {
      return [];
    }

    try {
      const placeholders = referenceIds.map(() => '?').join(', ');
      const [rows] = await mysqlPool.query(
        `SELECT sr.reference_id AS referenceId, s.id, s.name
         FROM ${tableName} sr
         JOIN skills s ON s.id = sr.skill_id
         WHERE sr.type = ? AND sr.reference_id IN (${placeholders})
         ORDER BY s.sort_order ASC, s.name ASC`,
        [type, ...referenceIds]
      );
      return rows;
    } catch (error) {
      logger.error('Database query failed in getSkillsForReferencesDataAccess:', error.message);
      throw error;
    }
  };
}

module.exports = makeGetSkillsForReferencesDataAccess;
