function makeGetResumeByIdDataAccess({ logger, mysqlPool, tableName }) {
  return async function getResumeByIdDataAccess({ id }) {
    try {
      const query = `
        SELECT
          id,
          filename,
          file_url AS fileUrl,
          is_active AS isActive,
          uploaded_at AS uploadedAt
        FROM ${tableName}
        WHERE id = ?
        LIMIT 1
      `;

      const [rows] = await mysqlPool.query(query, [id]);
      return rows[0] || null;
    } catch (error) {
      logger.error('Database query failed in getResumeByIdDataAccess:', error.message);
      throw error;
    }
  };
}

module.exports = makeGetResumeByIdDataAccess;
