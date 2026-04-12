function makeInsertReferencesDataAccess({ logger, mysqlPool, tableName }) {
  return async function insertReferencesDataAccess({ skillId, references }) {
    if (!references || references.length === 0) {
      return;
    }

    try {
      const placeholders = references.map(() => '(?, ?, ?)').join(', ');
      const values = references.flatMap(({ type, referenceId }) => [skillId, type, referenceId]);

      await mysqlPool.query(
        `INSERT INTO ${tableName} (skill_id, type, reference_id) VALUES ${placeholders}`,
        values
      );
    } catch (error) {
      logger.error('Database query failed in insertReferencesDataAccess:', error.message);
      throw error;
    }
  };
}

module.exports = makeInsertReferencesDataAccess;
