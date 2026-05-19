function makeGetResumesDataAccess({ logger, mysqlPool, tableName }) {
  return async function getResumesDataAccess() {
    try {
      const query = `
        SELECT
          id,
          filename,
          file_url AS fileUrl,
          is_active AS isActive,
          uploaded_at AS uploadedAt
        FROM ${tableName}
        ORDER BY uploaded_at DESC
      `;

      const [rows] = await mysqlPool.query(query);
      return rows;
    } catch (error) {
      logger.error('Database query failed in getResumesDataAccess:', error.message);
      throw error;
    }
  };
}

module.exports = makeGetResumesDataAccess;
