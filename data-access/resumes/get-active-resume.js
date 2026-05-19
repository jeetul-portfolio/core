function makeGetActiveResumeDataAccess({ logger, mysqlPool, tableName }) {
  return async function getActiveResumeDataAccess() {
    try {
      const query = `
        SELECT
          id,
          filename,
          file_url AS fileUrl,
          is_active AS isActive,
          uploaded_at AS uploadedAt
        FROM ${tableName}
        WHERE is_active = TRUE
        LIMIT 1
      `;

      const [rows] = await mysqlPool.query(query);
      return rows[0] || null;
    } catch (error) {
      logger.error('Database query failed in getActiveResumeDataAccess:', error.message);
      throw error;
    }
  };
}

module.exports = makeGetActiveResumeDataAccess;
