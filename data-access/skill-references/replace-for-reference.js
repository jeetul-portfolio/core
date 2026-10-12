/** Replaces the skills linked to one reference (e.g. project 7) in a single transaction. */
function makeReplaceForReferenceDataAccess({ logger, mysqlPool, tableName }) {
  return async function replaceForReferenceDataAccess({ type, referenceId, skillIds }) {
    const connection = await mysqlPool.getConnection();
    try {
      await connection.beginTransaction();
      await connection.query(
        `DELETE FROM ${tableName} WHERE type = ? AND reference_id = ?`,
        [type, referenceId]
      );

      const uniqueSkillIds = [...new Set(skillIds || [])];
      if (uniqueSkillIds.length > 0) {
        const placeholders = uniqueSkillIds.map(() => '(?, ?, ?)').join(', ');
        await connection.query(
          `INSERT INTO ${tableName} (skill_id, type, reference_id) VALUES ${placeholders}`,
          uniqueSkillIds.flatMap((skillId) => [skillId, type, referenceId])
        );
      }

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      logger.error('Database query failed in replaceForReferenceDataAccess:', error.message);
      throw error;
    } finally {
      connection.release();
    }
  };
}

module.exports = makeReplaceForReferenceDataAccess;
