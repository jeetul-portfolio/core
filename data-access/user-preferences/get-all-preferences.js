function makeGetAllPreferencesDataAccess({ logger, mysqlPool, tableName }) {
  return async function getAllPreferencesDataAccess({ userId }) {
    try {
      const [rows] = await mysqlPool.query(
        `SELECT id, user_id AS userId, type, meta, created_at AS createdAt, updated_at AS updatedAt
         FROM ${tableName}
         WHERE user_id = ?
         ORDER BY type ASC`,
        [userId]
      );
      return rows;
    } catch (error) {
      logger.error('Database query failed in getAllPreferencesDataAccess:', error.message);
      throw error;
    }
  };
}

module.exports = makeGetAllPreferencesDataAccess;
