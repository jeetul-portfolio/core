function makeGetPreferenceDataAccess({ logger, mysqlPool, tableName }) {
  return async function getPreferenceDataAccess({ userId, type }) {
    try {
      const [rows] = await mysqlPool.query(
        `SELECT id, user_id AS userId, type, meta, created_at AS createdAt, updated_at AS updatedAt
         FROM ${tableName}
         WHERE user_id = ? AND type = ?
         LIMIT 1`,
        [userId, type]
      );
      return rows[0] || null;
    } catch (error) {
      logger.error('Database query failed in getPreferenceDataAccess:', error.message);
      throw error;
    }
  };
}

module.exports = makeGetPreferenceDataAccess;
