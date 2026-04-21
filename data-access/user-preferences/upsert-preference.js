function makeUpsertPreferenceDataAccess({ logger, mysqlPool, tableName }) {
  return async function upsertPreferenceDataAccess({ userId, type, meta }) {
    try {
      await mysqlPool.query(
        `INSERT INTO ${tableName} (user_id, type, meta)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE meta = VALUES(meta), updated_at = NOW()`,
        [userId, type, meta]
      );

      const [rows] = await mysqlPool.query(
        `SELECT id, user_id AS userId, type, meta, created_at AS createdAt, updated_at AS updatedAt
         FROM ${tableName}
         WHERE user_id = ? AND type = ?
         LIMIT 1`,
        [userId, type]
      );

      return rows[0] || null;
    } catch (error) {
      logger.error('Database query failed in upsertPreferenceDataAccess:', error.message);
      throw error;
    }
  };
}

module.exports = makeUpsertPreferenceDataAccess;
